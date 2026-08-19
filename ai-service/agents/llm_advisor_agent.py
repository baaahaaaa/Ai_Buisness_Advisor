import json
import requests

from config import OLLAMA_URL, OLLAMA_MODEL as MODEL


def enrich_client_data(data):

    risque = data.get("risque", {})
    segmentation = data.get("segmentation", {})
    fraude = data.get("fraude", {})
    compliance = data.get("compliance", {})

    score = risque.get("score_risque", 0)

    if score < 30:
        niveau_risque = "Faible"
    elif score < 60:
        niveau_risque = "Modere"
    else:
        niveau_risque = "Eleve"

    age = segmentation.get("age", 0)
    anciennete = segmentation.get("anciennete", 0)

    data["indicateurs_metier"] = {
        "niveau_risque": niveau_risque,
        "jeune_conducteur": age < 25,
        "anciennete_faible": anciennete <= 2,
        "absence_sinistre": risque.get("nb_sinistres", 0) == 0,
        "retard_paiement": risque.get("nb_retards", 0) > 0,
        "fraude_detectee": fraude.get("fraude_suspecte", False),
        "client_conforme": compliance.get("statut_conformite") == "Valide"
    }

    data["confidence"] = data.get("confidence", {"score": None, "niveau": "Non calcule"})

    return data


def build_llm_payload(data):
    """Copie allegee de `data` pour le prompt LLM : retire le dict SHAP brut
    (deja resume dans explication_textuelle) pour reduire le nombre de tokens
    envoyes et donc le temps de traitement du prompt par Ollama."""

    light = json.loads(json.dumps(data, ensure_ascii=False))
    if "risque" in light and "explication" in light["risque"]:
        del light["risque"]["explication"]
    return light


def ask_llm_advisor(data):

    data = enrich_client_data(data)
    llm_payload = build_llm_payload(data)

    prompt = f"""Tu es un expert Assurance Automobile.

Les donnees sont :

{json.dumps(llm_payload, indent=2, ensure_ascii=False)}

IMPORTANT :

Le champ confidence est DEJA calcule. NE LE MODIFIE JAMAIS. Ne renvoie PAS confidence.
Ne renvoie PAS analyse_metier sous forme d''objet. analyse_metier doit etre UNE PHRASE.
Les champs "resume" et "conclusion" sont OBLIGATOIRES et ne doivent JAMAIS etre une chaine
vide - ecris toujours au moins une phrase complete pour chacun des deux.
Utilise UNIQUEMENT les valeurs numeriques exactes fournies ci-dessus (nb_retards, nb_sinistres,
fraude_detectee, etc.) pour tes points forts/faibles - si nb_retards > 0, ne dis JAMAIS
"paiement regulier" ou equivalent, c''est l''inverse qui est vrai.
FORMAT DE SORTIE STRICT :
Ta reponse doit commencer directement par le caractere ''{{'' et se terminer par ''}}''.
N''ecris AUCUN texte, AUCUNE explication, AUCUN raisonnement avant ou apres le JSON.
Pas de "Je vais analyser...", pas de titres markdown, pas de phrase d''introduction.
Uniquement le JSON brut, rien d''autre.

Retourne uniquement ce JSON :

{{
"resume":"",
"analyse_metier":"",
"points_forts":[
"..."
],
"points_faibles":[
"..."
],
"actions_recommandees":[
"..."
],
"conclusion":""
}}
"""

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL,
            "prompt": prompt,
            "stream": False,
            "keep_alive": "30m",
            "options": {
                "temperature": 0.1,
                "num_predict": 800
            }
        },
        timeout=300
    )

    response.raise_for_status()

    txt = response.json()["response"]

    txt = txt.replace("```json", "")
    txt = txt.replace("```", "")
    txt = txt.strip()

    start = txt.find("{")
    end = txt.rfind("}")
    if start != -1 and end != -1 and end > start:
        txt_json = txt[start:end + 1]
    else:
        txt_json = txt

    try:
        result = json.loads(txt_json)
    except Exception:
        result = {
            "resume": "",
            "analyse_metier": txt,
            "points_forts": [],
            "points_faibles": [],
            "actions_recommandees": [],
            "conclusion": ""
        }

    if isinstance(result.get("analyse_metier"), dict):
        result["analyse_metier"] = (
            "Analyse metier generee automatiquement a partir des resultats des agents."
        )

    def clean(lst):
        new = []
        for x in lst:
            if isinstance(x, str):
                new.append(x)
            elif isinstance(x, dict):
                new.append(" - ".join(str(v) for v in x.values()))
            else:
                new.append(str(x))
        return new

    result["points_forts"] = clean(result.get("points_forts", []))
    result["points_faibles"] = clean(result.get("points_faibles", []))
    result["actions_recommandees"] = clean(result.get("actions_recommandees", []))

    result["confidence"] = data["confidence"]

    return result


def answer_client_question(context: dict, question: str) -> str:
    """Repond en texte libre a une question posee par l''utilisateur, en se basant
    sur le contexte deja calcule pour un client (segmentation, risque, pricing, etc.)."""

    prompt = f"""Tu es un expert senior en assurance automobile qui repond aux questions
d''un gestionnaire de portefeuille sur un client precis.

CONTEXTE CLIENT (donnees reelles, deja calculees par les agents d''analyse) :
{json.dumps(context, indent=2, ensure_ascii=False)}

QUESTION DE L''UTILISATEUR :
{question}

INSTRUCTIONS :
- Reponds UNIQUEMENT en texte simple, en francais, PAS de JSON, PAS de markdown.
- Base-toi exclusivement sur les donnees du CONTEXTE CLIENT ci-dessus, ne jamais inventer de chiffre.
- Dans le champ "explication" (valeurs SHAP), un nombre POSITIF augmente TOUJOURS le risque,
  un nombre NEGATIF le REDUIT TOUJOURS.
- Reponse claire et concise, 2 a 5 phrases maximum.
"""

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL,
            "prompt": prompt,
            "stream": False,
            "keep_alive": "30m",
            "options": {
                "temperature": 0.3,
                "num_predict": 400
            }
        },
        timeout=300
    )
    response.raise_for_status()

    ollama_data = response.json()
    return ollama_data.get("response", "").strip()