import os
import json
import logging
import sys
from datetime import datetime, date
from pathlib import Path

import mysql.connector
from dotenv import load_dotenv
from openai import OpenAI, APIError, APITimeoutError, RateLimitError

sys.path.append(str(Path(__file__).parent.parent))

from agents.segmentation_agent import get_segment
from agents.risk_agent import get_risk_score
from agents.pricing_agent import get_recommended_price
from agents.recommendation_agent import get_recommendations
from agents.fraud_agent import detect_fraud
from agents.compliance_agent import check_compliance
from db.mongo_client import save_chat_message

load_dotenv()

API_KEY = os.getenv("GROQ_API_KEY")
BASE_URL = "https://api.groq.com/openai/v1"
MODEL = "llama-3.3-70b-versatile"

client_llm = OpenAI(api_key=API_KEY, base_url=BASE_URL) if API_KEY else None

DB_CONFIG = {
    "host": "localhost",
    "port": 3307,
    "user": "root",
    "password": "",
    "database": "ai_business_advisor"
}

logging.basicConfig(
    filename="advisor.log",
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s"
)

conversation_memory = []


def add_to_memory(question, answer):
    conversation_memory.append({
        "question": question,
        "answer": answer,
        "date": datetime.now().isoformat()
    })
    if len(conversation_memory) > 10:
        conversation_memory.pop(0)


def check_api():
    if client_llm is None:
        raise Exception("GROQ_API_KEY absente ou invalide.")


def get_connection():
    return mysql.connector.connect(**DB_CONFIG)


def json_serial(obj):
    if isinstance(obj, (date, datetime)):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} non sérialisable")


def get_client(client_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM clients WHERE client_id=%s", (client_id,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    return row


SYSTEM_PROMPT = """Tu es l'assistant IA d'une compagnie d'assurance automobile, destiné aux directeurs et responsables métier.
Tu réponds UNIQUEMENT à partir des données fournies dans le contexte (résultats des agents internes : segmentation, risque, pricing, recommandation, fraude, conformité).
Règles strictes :
- Ne jamais inventer de chiffres ou de faits absents du contexte.
- Si une information n'est pas disponible, dis-le clairement.
- Réponds de manière professionnelle, concise et orientée décision business.
- Explique le "pourquoi" quand c'est pertinent (ex: pourquoi ce score de risque, pourquoi cette prime).
- Si le client est éligible à la télématique (boîtier connecté), mentionne-le comme une opportunité forte.
"""


def build_context(client_id):
    client = get_client(client_id)
    if client is None:
        return None

    segmentation = get_segment(client_id)
    risk = get_risk_score(client_id)
    pricing = get_recommended_price(client_id)
    recommendation = get_recommendations(client_id)
    fraud = detect_fraud(client_id)
    compliance = check_compliance(
        client_id=client_id,
        age=client.get("age"),
        prime_actuelle=pricing.get("prime_actuelle"),
        prime_recommandee=pricing.get("prime_recommandee", 0),
        fraude_suspecte=fraud.get("fraude_suspecte", False)
    )

    return {
        "client": client,
        "segmentation": segmentation,
        "risk": risk,
        "pricing": pricing,
        "recommendation": recommendation,
        "fraud": fraud,
        "compliance": compliance
    }


def build_prompt_context(context):
    client = context["client"]
    risk = context["risk"]
    pricing = context["pricing"]
    recommendation = context["recommendation"]
    fraud = context["fraud"]
    compliance = context["compliance"]
    segmentation = context["segmentation"]

    return f"""
================ CLIENT ================
Nom : {client.get("prenom", "N/A")} {client.get("nom", "N/A")}
Age : {client.get("age", "N/A")}
Ville : {client.get("ville", "N/A")}

================ SEGMENTATION ================
Segment : {segmentation.get("segment_predit", "N/A")}

================ RISQUE ================
Score : {risk.get("score_risque", "N/A")}/100
Sinistres (5 ans) : {risk.get("nb_sinistres", "N/A")}
Retards de paiement : {risk.get("nb_retards", "N/A")}

================ PRICING ================
Prime actuelle : {pricing.get("prime_actuelle", "N/A")} DT
Prime recommandée : {pricing.get("prime_recommandee", "N/A")} DT ({pricing.get("variation_pct", "N/A")}%)

================ RECOMMANDATIONS ================
{", ".join(recommendation.get("recommandations", []))}
Éligible télématique : {"Oui" if recommendation.get("telematics_eligible") else "Non"}

================ FRAUDE ================
Fraude suspectée : {"Oui" if fraud.get("fraude_suspecte") else "Non"}
Alertes : {", ".join(fraud.get("alertes", []))}

================ CONFORMITE ================
Statut : {compliance.get("statut_conformite", "N/A")}
""".strip()


def build_history():
    if not conversation_memory:
        return "(aucun échange précédent)"
    return "\n\n".join(
        f"Question : {item['question']}\nRéponse : {item['answer']}"
        for item in conversation_memory
    )


def ask_llm_advisor(client_id: int, question: str) -> dict:
    try:
        check_api()
    except Exception as e:
        return {"success": False, "error": str(e)}

    context = build_context(client_id)
    if context is None:
        return {"success": False, "error": "Client introuvable"}

    context_text = build_prompt_context(context)
    history = build_history()

    user_message = f"""Historique de conversation récent :
{history}

========================================
Contexte Client :
{context_text}
========================================
Question du directeur :
{question}"""

    try:
        response = client_llm.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message}
            ],
            temperature=0.3,
            max_tokens=500,
            timeout=15
        )
        answer = response.choices[0].message.content

        add_to_memory(question, answer)
        logging.info(f"Client={client_id} | Question={question}")

        save_chat_message(client_id, question, answer, success=True)


        return {
            "success": True,
            "client_id": client_id,
            "question": question,
            "answer": answer,
            "context": context
        }

    except RateLimitError:
        return {"success": False, "error": "Limite de requêtes atteinte, réessayez dans quelques instants."}
    except APITimeoutError:
        return {"success": False, "error": "Le service LLM a mis trop de temps à répondre."}
    except APIError as e:
        return {"success": False, "error": f"Erreur du service LLM : {str(e)}"}
    except Exception as e:
        logging.error(f"Erreur LLM: {e}")
        return {"success": False, "error": str(e)}


if __name__ == "__main__":
    response = ask_llm_advisor(
        client_id=1,
        question="Analyse ce client et donne-moi une stratégie commerciale."
    )
    print(json.dumps(response, indent=4, ensure_ascii=False, default=json_serial))