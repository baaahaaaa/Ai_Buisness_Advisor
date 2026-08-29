import json
import requests

from config import GROQ_API_KEY, GROQ_MODEL

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


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
    envoyes et donc le temps de traitement du prompt."""

    light = json.loads(json.dumps(data, ensure_ascii=False))
    if "risque" in light and "explication" in light["risque"]:
        del light["risque"]["explication"]
    return light


def _call_groq(prompt: str, temperature: float, max_tokens: int) -> str:

    if not GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY manquant")

    print(f"[GROQ] Appel du modele : {GROQ_MODEL}", flush=True)

    response = requests.post(
        GROQ_URL,
        headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": GROQ_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": temperature,
            "max_tokens": max_tokens
        },
        timeout=30
    )

    print(f"[GROQ] HTTP status : {response.status_code}", flush=True)

    if response.status_code != 200:
        print("[GROQ] Erreur API :", response.text[:1000], flush=True)
        response.raise_for_status()

    result = response.json()
    content = result.get("choices", [{}])[0].get("message", {}).get("content", "")

    print("[GROQ] Reponse recue (500 premiers car.) :", content[:500], flush=True)

    if not content:
        raise RuntimeError("Groq a retourne une reponse vide")

    return content

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
    txt = _call_groq(prompt, temperature=0.1, max_tokens=1000)

    # ---------------------------------------------------------
    # NETTOYAGE DE LA REPONSE LLM
    # ---------------------------------------------------------

    txt = txt.strip()

    # Retirer les éventuels blocs Markdown
    if txt.startswith("```json"):
        txt = txt[7:]

    if txt.startswith("```"):
        txt = txt[3:]

    if txt.endswith("```"):
        txt = txt[:-3]

    txt = txt.strip()

    # ---------------------------------------------------------
    # EXTRACTION DU JSON
    # ---------------------------------------------------------

    result = None

    start = txt.find("{")
    end = txt.rfind("}")

    if start != -1 and end != -1 and end > start:

        txt_json = txt[start:end + 1]

        try:
            result = json.loads(txt_json)

        except json.JSONDecodeError as e:

            print("Erreur parsing JSON LLM :", e)
            print("Reponse LLM brute :", txt)

    # ---------------------------------------------------------
    # FALLBACK SI LE JSON EST INVALIDE
    # ---------------------------------------------------------

    if not isinstance(result, dict):

        result = {
            "resume": (
                f"Client {data.get('client_id', 'inconnu')} "
                f"avec un niveau de risque "
                f"{data.get('indicateurs_metier', {}).get('niveau_risque', 'inconnu')}."
            ),

            "analyse_metier": (
                "Analyse automatique basee sur les resultats "
                "de segmentation, risque, tarification, fraude "
                "et conformite."
            ),

            "points_forts": [],

            "points_faibles": [],

            "actions_recommandees": [],

            "conclusion": (
                "Les resultats doivent etre interpretes "
                "avec les indicateurs fournis par les differents agents."
            )
        }

    # ---------------------------------------------------------
    # GARANTIR LES CHAMPS OBLIGATOIRES
    # ---------------------------------------------------------

    result.setdefault("resume", "")
    result.setdefault("analyse_metier", "")
    result.setdefault("points_forts", [])
    result.setdefault("points_faibles", [])
    result.setdefault("actions_recommandees", [])
    result.setdefault("conclusion", "")

    # ---------------------------------------------------------
    # SECURISER LES TEXTES
    # ---------------------------------------------------------

    if not isinstance(result["resume"], str):
        result["resume"] = str(result["resume"])

    if not result["resume"].strip():

        score = data.get("risque", {}).get("score_risque", 0)
        age = data.get("segmentation", {}).get("age", 0)
        sinistres = data.get("risque", {}).get("nb_sinistres", 0)

        result["resume"] = (
            f"Client {data.get('client_id', 'inconnu')}, age de {age} ans, "
            f"avec un score de risque de {score} et "
            f"{sinistres} sinistre(s) declare(s)."
        )

    if not isinstance(result["analyse_metier"], str):
        result["analyse_metier"] = str(result["analyse_metier"])

    if not result["analyse_metier"].strip():
        result["analyse_metier"] = (
            "Analyse metier generee a partir des resultats "
            "des agents IA."
        )

    if not isinstance(result["conclusion"], str):
        result["conclusion"] = str(result["conclusion"])

    if not result["conclusion"].strip():
        result["conclusion"] = (
            "La decision finale doit tenir compte du risque, "
            "de la tarification et du statut de conformite."
        )

    # ---------------------------------------------------------
    # ANALYSE_METIER DOIT RESTER UNE PHRASE
    # ---------------------------------------------------------

    if isinstance(result.get("analyse_metier"), dict):

        result["analyse_metier"] = (
            "Analyse metier generee automatiquement "
            "a partir des resultats des agents."
        )

    # ---------------------------------------------------------
    # NETTOYAGE DES LISTES
    # ---------------------------------------------------------

    def clean(lst):

        if not isinstance(lst, list):
            return []

        new = []

        for x in lst:

            if isinstance(x, str):

                value = x.strip()

                if value:
                    new.append(value)

            elif isinstance(x, dict):

                value = " - ".join(
                    str(v) for v in x.values()
                ).strip()

                if value:
                    new.append(value)

            else:

                value = str(x).strip()

                if value:
                    new.append(value)

        return new

    result["points_forts"] = clean(
        result.get("points_forts", [])
    )

    result["points_faibles"] = clean(
        result.get("points_faibles", [])
    )

    result["actions_recommandees"] = clean(
        result.get("actions_recommandees", [])
    )

    # ---------------------------------------------------------
    # CONFIDENCE = CALCULEE PAR LE SYSTEME
    # ---------------------------------------------------------

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

    return _call_groq(prompt, temperature=0.3, max_tokens=400).strip()