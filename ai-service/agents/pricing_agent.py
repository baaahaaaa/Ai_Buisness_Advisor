import mysql.connector

from config import DB_CONFIG
from agents.segmentation_agent import get_segment
from agents.risk_agent import get_risk_score

SEGMENT_BASE_PRIME = {
    0:650,
    1:720,
    2:800,
    3:900,
    4:1000
}


def get_current_prime(client_id):

    conn = mysql.connector.connect(**DB_CONFIG)

    cursor = conn.cursor()

    cursor.execute("""

        SELECT premium

        FROM policy

        WHERE client_id=%s

        ORDER BY start_date DESC

        LIMIT 1

    """,(client_id,))

    row=cursor.fetchone()

    cursor.close()

    conn.close()

    if row:

        return float(row[0])

    return None


def get_recommended_price(client_id):

    segmentation=get_segment(client_id)

    risk=get_risk_score(client_id)

    if "error" in segmentation:

        return segmentation

    if "error" in risk:

        return risk

    segment=segmentation["segment"]

    score=risk["score_risque"]

    base=SEGMENT_BASE_PRIME.get(segment,800)

    prime=round(base*(1+score/100),2)

    actuelle=get_current_prime(client_id)

    variation=None

    if actuelle:

        variation=round(((prime-actuelle)/actuelle)*100,2)

    return{

        "client_id":client_id,

        "segment":segment,

        "score_risque":score,

        "prime_actuelle":actuelle,

        "prime_recommandee":prime,

        "variation_pct":variation

    }