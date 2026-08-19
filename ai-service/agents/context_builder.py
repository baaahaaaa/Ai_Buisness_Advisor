"""
Construction du contexte multi-agents pour un client donné.

Ce module existe pour casser le cycle d'import
orchestrator.py -> reporting_agent.py -> orchestrator.py :
la logique de construction de contexte vit ici, et orchestrator.py
comme reporting_agent.py l'importent tous les deux depuis ce module.
"""

import mysql.connector

from config import DB_CONFIG
from agents.segmentation_agent import get_segment
from agents.risk_agent import get_risk_score
from agents.pricing_agent import get_recommended_price
from agents.recommendation_agent import get_recommendations
from agents.fraud_agent import detect_fraud
from agents.compliance_agent import check_compliance
from agents.explainability_agent import explain_risk
from agents.confidence_agent import compute_confidence


def get_client_age(client_id: int):
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute(
            "SELECT TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) AS age FROM client WHERE id = %s",
            (client_id,)
        )
        row = cursor.fetchone()
        cursor.close()
        conn.close()
        return row[0] if row else None
    except Exception:
        return None


def build_client_context(client_id: int) -> dict:
    segmentation_result = get_segment(client_id)
    risk_result = get_risk_score(client_id)
    if "explication" in risk_result:
        risk_result["explication_textuelle"] = explain_risk(risk_result["explication"])
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

    confidence_result = compute_confidence(
        segmentation=segmentation_result,
        risk=risk_result,
        pricing=pricing_result,
        fraud=fraud_result,
        compliance=compliance_result
    )

    return {
        "segmentation": segmentation_result,
        "risque": risk_result,
        "pricing": pricing_result,
        "recommandations": recommendation_result,
        "fraude": fraud_result,
        "compliance": compliance_result,
        "confidence": confidence_result
    }