from fastapi import APIRouter, Response, HTTPException
from pydantic import BaseModel
import mysql.connector
from fastapi import Depends
from fastapi import APIRouter, Response, HTTPException
from auth import verify_token
from config import DB_CONFIG
from agents.segmentation_agent import get_segment
from agents.risk_agent import get_risk_score
from agents.pricing_agent import get_recommended_price
from agents.recommendation_agent import get_recommendations
from agents.fraud_agent import detect_fraud
from agents.compliance_agent import check_compliance
from agents.llm_advisor_agent import ask_llm_advisor, answer_client_question
from agents.data_analyst_agent import analyze_data
from agents.reporting_agent import generate_report, save_report, generate_report_pdf
from agents.context_builder import build_client_context
from db.mongo_client import get_chat_history, save_chat_message
from agents.explainability_agent import explain_risk


class ChatRequest(BaseModel):
    question: str

router = APIRouter()


def save_analysis_result(client_id, segmentation, risk, pricing, recommendation, fraud, compliance):
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO agent_result
                (client_id, segment, risk_score, recommended_premium, recommendation, fraud_score, compliance)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            client_id,
            segmentation.get("segment"),
            risk.get("score_risque"),
            pricing.get("prime_recommandee"),
            ", ".join(recommendation.get("recommandations", [])) if recommendation else None,
            fraud.get("score_suspicion"),
            compliance.get("statut_conformite")
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"Erreur sauvegarde resultat : {e}")
        return False


@router.get("/analyse/{client_id}", dependencies=[Depends(verify_token)])
def analyse_client(client_id: int):
    context = build_client_context(client_id)

    if "error" in context:
        raise HTTPException(status_code=404, detail=context["error"])

    save_analysis_result(
        client_id,
        context["segmentation"],
        context["risque"],
        context["pricing"],
        context["recommandations"],
        context["fraude"],
        context["compliance"]
    )

    try:
        analyse_llm = ask_llm_advisor({**context})
    except Exception as e:
        print("Erreur LLM :", e)
        analyse_llm = {
            "resume": "Analyse IA indisponible",
            "analyse_metier": str(e),
            "points_forts": [],
            "points_faibles": [],
            "actions_recommandees": [],
            "conclusion": ""
        }

    return {
        "client_id": client_id,
        **context,
        "analyse_ia": analyse_llm
    }


@router.post("/chat/{client_id}", dependencies=[Depends(verify_token)])
def chat_with_advisor(client_id: int, request: ChatRequest):
    context = build_client_context(client_id)

    if "error" in context:
        raise HTTPException(status_code=404, detail=context["error"])

    try:
        answer = answer_client_question(context, request.question)
        success = True
    except Exception as e:
        print("Erreur chat LLM :", e)
        answer = "Desole, je n''ai pas pu generer de reponse pour le moment."
        success = False

    save_chat_message(client_id, request.question, answer, success)

    return {
        "success": success,
        "client_id": client_id,
        "question": request.question,
        "answer": answer,
        "context": context
    }


@router.get(
    "/dashboard",
    dependencies=[Depends(verify_token)]
)
def get_dashboard():
    return analyze_data()

@router.get("/report/client/{client_id}", dependencies=[Depends(verify_token)])
def get_client_report(client_id: int):
    return generate_report(client_id)


@router.get(
    "/report/global",
    dependencies=[Depends(verify_token)]
)
def get_global_report():
    return generate_report()

@router.get("/report/client/{client_id}/pdf", dependencies=[Depends(verify_token)])
def get_client_report_pdf(client_id: int):
    pdf_bytes = generate_report_pdf(client_id)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="rapport_client_{client_id}.pdf"'
        }
    )


@router.get("/report/global/pdf", dependencies=[Depends(verify_token)])
def get_global_report_pdf():
    pdf_bytes = generate_report_pdf()
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": 'attachment; filename="rapport_global.pdf"'
        }
    )


@router.post("/report/save/client/{client_id}", dependencies=[Depends(verify_token)])
def save_client_report(client_id: int):
    filename = save_report(client_id)
    return {"status": "success", "filename": filename}


@router.post("/report/save/global", dependencies=[Depends(verify_token)])
def save_global_report():
    filename = save_report()
    return {"status": "success", "filename": filename}


@router.get("/health")
def health_check():
    return {"status": "healthy"}

@router.get("/historique/{client_id}", dependencies=[Depends(verify_token)])
def get_historique(client_id: int):
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, segment, risk_score, recommended_premium, recommendation,
                   fraud_score, compliance, analysis_date
            FROM agent_result
            WHERE client_id = %s
            ORDER BY analysis_date DESC
        """, (client_id,))
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return {"client_id": client_id, "nb_analyses": len(rows), "historique": rows}
    except Exception as e:
        return {"error": str(e)}


@router.get("/chat/{client_id}/historique", dependencies=[Depends(verify_token)])
def get_chat_historique(client_id: int, limit: int = 20):
    return {
        "client_id": client_id,
        "historique_chat": get_chat_history(client_id, limit)
    }
