"""
Construction du contexte multi-agents pour un client donné.

Ce module existe pour casser le cycle d'import
orchestrator.py -> reporting_agent.py -> orchestrator.py :
la logique de construction de contexte (autrefois définie
directement dans orchestrator.py) vit ici, et orchestrator.py
comme reporting_agent.py l'importent tous les deux depuis ce module.

Convention d'erreur : chaque agent (segmentation, risque, pricing,
recommandations, fraude) retourne {"error": "..."} quand le client
n'a pas de données suffisantes (ex: pas de véhicule/police associée).
build_client_context vérifie cette clé après CHAQUE appel et
court-circuite immédiatement dès qu'elle apparaît, plutôt que de
laisser un agent en aval planter avec un KeyError en supposant que
les champs habituels sont présents.
"""

from agents.segmentation_agent import get_segment
from agents.risk_agent import get_risk_score
from agents.pricing_agent import get_recommended_price
from agents.recommendation_agent import get_recommendations
from agents.fraud_agent import detect_fraud
from agents.compliance_agent import check_compliance
from agents.explainability_agent import explain_risk
from config import DB_CONFIG

import mysql.connector


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


def _client_error(client_id: int, message: str) -> dict:
    """Structure d'erreur cohérente retournée dès qu'un agent échoue."""
    return {
        "error": message,
        "client_id": client_id,
    }


def build_client_context(client_id: int) -> dict:
    segmentation_result = get_segment(client_id)
    if "error" in segmentation_result:
        return _client_error(client_id, segmentation_result["error"])

    risk_result = get_risk_score(client_id)
    if "error" in risk_result:
        return _client_error(client_id, risk_result["error"])
    if "explication" in risk_result:
        risk_result["explication_textuelle"] = explain_risk(risk_result["explication"])

    pricing_result = get_recommended_price(client_id)
    if "error" in pricing_result:
        return _client_error(client_id, pricing_result["error"])

    recommendation_result = get_recommendations(client_id)
    if "error" in recommendation_result:
        return _client_error(client_id, recommendation_result["error"])

    fraud_result = detect_fraud(client_id)
    if "error" in fraud_result:
        return _client_error(client_id, fraud_result["error"])

    age = get_client_age(client_id)
    compliance_result = check_compliance(
        client_id=client_id,
        age=age,
        prime_recommandee=pricing_result.get("prime_recommandee", 0),
        prime_actuelle=pricing_result.get("prime_actuelle"),
        fraude_suspecte=fraud_result.get("fraude_suspecte", False)
    )

    return {
        "segmentation": segmentation_result,
        "risque": risk_result,
        "pricing": pricing_result,
        "recommandations": recommendation_result,
        "fraude": fraud_result,
        "compliance": compliance_result
    }