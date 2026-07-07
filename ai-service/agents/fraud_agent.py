import mysql.connector
from datetime import datetime

DB_CONFIG = {
    "host": "localhost", "port": 3307,
    "user": "root", "password": "",
    "database": "ai_business_advisor"
}

# Connexion réutilisable
def get_connection():
    return mysql.connector.connect(**DB_CONFIG)


def load_client_sinistres(client_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT sinistre_id, date_sinistre, montant, type_sinistre
        FROM sinistres
        WHERE client_id = %s
        ORDER BY date_sinistre
    """, (client_id,))
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return rows


def load_client_info(client_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT date_inscription FROM clients WHERE client_id = %s
    """, (client_id,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    return row


def detect_fraud(client_id: int) -> dict:
    sinistres = load_client_sinistres(client_id)
    client_info = load_client_info(client_id)

    if client_info is None:
        return {"error": "client introuvable"}

    alertes = []
    score_suspicion = 0

    if len(sinistres) >= 3:
        dates = [s["date_sinistre"] for s in sinistres]
        ecart_jours = (max(dates) - min(dates)).days
        if ecart_jours > 0 and ecart_jours < 180:
            alertes.append("Fréquence de sinistres anormalement élevée sur une courte période")
            score_suspicion += 40

    for s in sinistres:
        if float(s["montant"]) > 4000:
            alertes.append(f"Sinistre à montant élevé détecté ({s['montant']} DT, {s['type_sinistre']})")
            score_suspicion += 20
            break

    date_inscription = client_info["date_inscription"]
    for s in sinistres:
        jours_depuis_inscription = (s["date_sinistre"] - date_inscription).days
        if 0 <= jours_depuis_inscription < 30:
            alertes.append("Sinistre déclaré moins de 30 jours après la souscription")
            score_suspicion += 25
            break

    score_suspicion = min(score_suspicion, 100)
    fraude_suspecte = score_suspicion >= 50

    return {
        "client_id": client_id,
        "nb_sinistres_analyses": len(sinistres),
        "score_suspicion": score_suspicion,
        "fraude_suspecte": fraude_suspecte,
        "alertes": alertes if alertes else ["Aucune anomalie détectée"]
    }