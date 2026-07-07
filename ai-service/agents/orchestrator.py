from fastapi import APIRouter
from pydantic import BaseModel
import mysql.connector

# Imports des agents
from agents.segmentation_agent import get_segment
from agents.risk_agent import get_risk_score
from agents.pricing_agent import get_recommended_price
from agents.recommendation_agent import get_recommendations
from agents.fraud_agent import detect_fraud
from agents.compliance_agent import check_compliance
from agents.llm_advisor_agent import ask_llm_advisor
from agents.data_analyst_agent import analyze_data
from agents.reporting_agent import generate_report, save_report
from db.mongo_client import get_chat_history


DB_CONFIG = {
    "host": "localhost", "port": 3307,
    "user": "root", "password": "",
    "database": "ai_business_advisor"
}

class ChatRequest(BaseModel):
    question: str

router = APIRouter()


def get_client_age(client_id: int):
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SELECT age FROM clients WHERE client_id = %s", (client_id,))
        row = cursor.fetchone()
        cursor.close()
        conn.close()
        return row[0] if row else None
    except Exception:
        return None
def save_analysis_result(client_id, segmentation, risk, pricing, fraud):
    """Sauvegarde le résultat d'une analyse dans resultats_agents (historique)."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO resultats_agents
                (client_id, segment_predit, score_risque, prime_recommandee, fraude_suspecte)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            client_id,
            segmentation.get("segment_predit"),
            risk.get("score_risque"),
            pricing.get("prime_recommandee"),
            fraud.get("fraude_suspecte", False)
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"⚠️ Erreur sauvegarde résultat : {e}")
        return False


@router.get("/analyse/{client_id}")
def analyse_client(client_id: int):
    segmentation_result = get_segment(client_id)
    risk_result = get_risk_score(client_id)
    pricing_result = get_recommended_price(client_id)
    recommendation_result = get_recommendations(client_id)
    fraud_result = detect_fraud(client_id)

    age = get_client_age(client_id)
    compliance_result = check_compliance(
        client_id=client_id,
        age=age,
        prime_recommandee=pricing_result.get("prime_recommandee", 0),
        prime_actuelle=pricing_result.get("prime_actuelle"),
        fraude_suspecte=fraud_result.get("fraude_suspecte", False)
    )
    save_analysis_result(client_id, segmentation_result, risk_result, pricing_result, fraud_result)

    return {
        "client_id": client_id,
        "segmentation": segmentation_result,
        "risque": risk_result,
        "pricing": pricing_result,
        "recommandations": recommendation_result,
        "fraude": fraud_result,
        "compliance": compliance_result
    }


@router.post("/chat/{client_id}")
def chat_with_advisor(client_id: int, request: ChatRequest):
    return ask_llm_advisor(client_id, request.question)


@router.get("/dashboard")
def get_dashboard():
    return analyze_data()


@router.get("/report/client/{client_id}")
def get_client_report(client_id: int):
    return generate_report(client_id)


@router.get("/report/global")
def get_global_report():
    return generate_report()


@router.post("/report/save/client/{client_id}")
def save_client_report(client_id: int):
    filename = save_report(client_id)
    return {"status": "success", "filename": filename}


@router.post("/report/save/global")
def save_global_report():
    filename = save_report()
    return {"status": "success", "filename": filename}


@router.get("/health")
def health_check():
    return {"status": "healthy"}
@router.get("/historique/{client_id}")
def get_historique(client_id: int):
    """Récupère l'historique des analyses passées pour un client."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT resultat_id, segment_predit, score_risque, prime_recommandee,
                   fraude_suspecte, date_analyse
            FROM resultats_agents
            WHERE client_id = %s
            ORDER BY date_analyse DESC
        """, (client_id,))
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return {"client_id": client_id, "nb_analyses": len(rows), "historique": rows}
    except Exception as e:
        return {"error": str(e)}
@router.get("/chat/{client_id}/historique")
def get_chat_historique(client_id: int, limit: int = 20):
    return {
        "client_id": client_id,
        "historique_chat": get_chat_history(client_id, limit)
    }