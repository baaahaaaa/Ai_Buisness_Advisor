import mysql.connector
from sqlalchemy import create_engine, text
from agents.segmentation_agent import get_segment
from agents.risk_agent import get_risk_score

DB_CONFIG = {
    "host": "localhost", "port": 3307,
    "user": "root", "password": "",
    "database": "ai_business_advisor"
}

# Engine SQLAlchemy performant (réutilisable)
engine = create_engine(
    f"mysql+pymysql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@"
    f"{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}",
    pool_size=10,
    max_overflow=20
)

# Prime de base selon le segment (règle métier)
SEGMENT_BASE_PRIME = {
    "Famille": 700,
    "Jeune": 950,
    "Professionnel": 800,
    "Senior": 600,
    "Inconnu": 750
}


def get_current_prime(client_id: int):
    """Récupère la prime actuelle du client depuis la table polices."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute(
            "SELECT prime_actuelle FROM polices WHERE client_id = %s ORDER BY date_debut DESC LIMIT 1",
            (client_id,)
        )
        row = cursor.fetchone()
        cursor.close()
        conn.close()
        return float(row[0]) if row else None
    except Exception as e:
        print(f"⚠️ Erreur récupération prime actuelle: {e}")
        return None


def get_recommended_price(client_id: int) -> dict:
    """Calcule une prime recommandée basée sur le segment + le score de risque."""
    segmentation = get_segment(client_id)
    risk = get_risk_score(client_id)

    if "error" in segmentation or "error" in risk:
        return {"error": "client introuvable"}

    segment = segmentation.get("segment_predit", "Inconnu")
    score_risque = risk.get("score_risque", 50)

    base = SEGMENT_BASE_PRIME.get(segment, 750)

    # Ajustement selon le risque : +1% de la base par point de risque au-dessus de 30
    ajustement = max(0, score_risque - 30) * (base * 0.01)
    prime_recommandee = round(base + ajustement, 2)

    prime_actuelle = get_current_prime(client_id)

    variation_pct = round(((prime_recommandee - prime_actuelle) / prime_actuelle) * 100, 1) if prime_actuelle else None

    return {
        "client_id": client_id,
        "segment": segment,
        "score_risque": score_risque,
        "prime_actuelle": prime_actuelle,
        "prime_recommandee": prime_recommandee,
        "variation_pct": variation_pct
    }