import mysql.connector
from agents.segmentation_agent import get_segment
from agents.risk_agent import get_risk_score

DB_CONFIG = {
    "host": "localhost", "port": 3307,
    "user": "root", "password": "",
    "database": "ai_business_advisor"
}

# Catalogue de recommandations par segment (règle métier simple)
SEGMENT_OFFERS = {
    "Famille": [
        "Assurance tous risques familiale",
        "Réduction multi-véhicules",
        "Option assistance enfants à bord"
    ],
    "Jeune": [
        "Formule jeune conducteur avec bonus prudence",
        "Application de conduite connectée (pay-as-you-drive)",
        "Réduction si installation boîtier télématique"
    ],
    "Professionnel": [
        "Assurance véhicule utilitaire / déplacement pro",
        "Assistance dépannage 24h/24",
        "Option remboursement kilométrique"
    ],
    "Senior": [
        "Formule tous risques senior",
        "Assistance 0km incluse",
        "Réduction fidélité longue durée"
    ]
}


def get_nb_retards(client_id: int) -> int:
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT COUNT(*) FROM paiements WHERE client_id = %s AND statut = 'retard'",
        (client_id,)
    )
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    return row[0] if row else 0


def get_recommendations(client_id: int) -> dict:
    segmentation = get_segment(client_id)
    risk = get_risk_score(client_id)

    if "error" in segmentation or "error" in risk:
        return {"error": "client introuvable"}

    segment = segmentation["segment_predit"]
    score_risque = risk["score_risque"]
    nb_retards = get_nb_retards(client_id)

    offres = list(SEGMENT_OFFERS.get(segment, []))

    # === LOGIQUE TÉLÉMATIQUE AMÉLIORÉE ===
    telematics_eligible = False

    if segment in ["Jeune", "Professionnel"] or score_risque > 35:
        offres.append("Installation boîtier télématique (réduction jusqu'à 25% selon conduite réelle)")
        offres.append("Programme Pay-As-You-Drive : tarification au km + bonus style de conduite")
        telematics_eligible = True

    if score_risque > 60:
        offres.append("Programme de prévention du risque (formation/conduite sécurisée)")

    if nb_retards >= 2:
        offres.append("Option paiement mensuel facilité (au lieu d'annuel)")

    if score_risque < 20:
        offres.append("Bonus fidélité - réduction 10% pour bon profil de risque")

    # Recommandation forte si éligible
    if telematics_eligible and score_risque > 40:
        offres.append("🔥 PRIORITÉ : Installation télématique recommandée pour réduire fortement la prime")

    return {
        "client_id": client_id,
        "segment": segment,
        "score_risque": score_risque,
        "recommandations": offres,
        "telematics_eligible": telematics_eligible,
        "telematics_potential_reduction": "jusqu'à 25%" if telematics_eligible else "Non éligible"
    }