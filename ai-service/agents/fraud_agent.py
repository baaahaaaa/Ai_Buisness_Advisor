import mysql.connector
from datetime import datetime

from config import DB_CONFIG


def get_connection():
    return mysql.connector.connect(**DB_CONFIG)


def load_client_claims(client_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
    SELECT
        c.claim_date,
        c.amount,
        c.claim_type
    FROM claim c
    JOIN policy p
        ON p.id = c.policy_id
    WHERE p.client_id = %s
    ORDER BY c.claim_date
    """, (client_id,))
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return rows


def load_client(client_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
    SELECT created_at
    FROM client
    WHERE id = %s
    """, (client_id,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    return row


def detect_fraud(client_id):
    claims = load_client_claims(client_id)
    client = load_client(client_id)

    if client is None:
        return {"error": "client introuvable"}

    score = 0
    alertes = []

    if len(claims) >= 3:
        dates = [c["claim_date"] for c in claims]
        if (max(dates) - min(dates)).days < 180:
            score += 40
            alertes.append("Beaucoup de sinistres sur une courte periode")

    for c in claims:
        if float(c["amount"]) > 4000:
            score += 20
            alertes.append("Montant de sinistre eleve")
            break

    score = min(score, 100)

    return {
        "client_id": client_id,
        "score_suspicion": score,
        "fraude_suspecte": score >= 50,
        "alertes": alertes
    }