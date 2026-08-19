import mysql.connector

from config import DB_CONFIG
from agents.segmentation_agent import get_segment
from agents.risk_agent import get_risk_score


def count_late_payments(client_id):

    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT COUNT(*)
        FROM payment p
        JOIN policy po ON po.id = p.policy_id
        WHERE po.client_id = %s
        AND p.status = 'LATE'
    """, (client_id,))

    n = cursor.fetchone()[0]

    cursor.close()
    conn.close()

    return n


def get_recommendations(client_id):

    segmentation = get_segment(client_id)
    risk = get_risk_score(client_id)
    late = count_late_payments(client_id)

    rec = []

    if risk["score_risque"] > 70:
        rec.append("Revision de la prime")

    if late > 0:
        rec.append("Proposer un paiement echelonne")

    if segmentation["segment"] == 0:
        rec.append("Offre fidelite")

    elif segmentation["segment"] == 1:
        rec.append("Offre jeune conducteur")

    elif segmentation["segment"] == 2:
        rec.append("Offre professionnelle")

    elif segmentation["segment"] == 3:
        rec.append("Offre senior")

    elif segmentation["segment"] == 4:
        rec.append("Pack Premium")

    return {
        "client_id": client_id,
        "segment": segmentation["segment"],
        "score_risque": risk["score_risque"],
        "recommandations": rec
    }