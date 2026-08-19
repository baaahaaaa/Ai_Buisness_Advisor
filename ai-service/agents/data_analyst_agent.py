import pandas as pd
import json
import sys
from pathlib import Path
from datetime import datetime
from sqlalchemy import create_engine, text

# Ajoute le chemin parent pour les imports
sys.path.append(str(Path(__file__).parent.parent))

from config import DB_CONFIG

engine = create_engine(
    f"mysql+pymysql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@"
    f"{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}",
    pool_size=10,
    max_overflow=20
)


def get_global_kpis():
    """KPIs globaux (schéma v2)"""
    queries = {
        "total_clients": "SELECT COUNT(*) AS total FROM client",
        "avg_age": "SELECT ROUND(AVG(TIMESTAMPDIFF(YEAR, birth_date, CURDATE())), 1) AS avg_age FROM client",
        "total_sinistres": "SELECT COUNT(*) AS total FROM claim",
        "avg_prime": "SELECT ROUND(AVG(premium), 2) AS avg_prime FROM policy",
        "retard_rate": """
            SELECT ROUND(COUNT(CASE WHEN status = 'LATE' THEN 1 END) * 100.0 / COUNT(*), 2) AS taux
            FROM payment
        """,
        "fraude_suspecte": """
            SELECT COUNT(*) AS total FROM (
                SELECT p.client_id
                FROM claim c
                JOIN policy p ON p.id = c.policy_id
                GROUP BY p.client_id
                HAVING COUNT(*) >= 3
            ) t
        """
    }

    kpis = {}
    for key, q in queries.items():
        try:
            df = pd.read_sql(text(q), engine)
            kpis[key] = float(df.iloc[0, 0]) if not df.empty else 0
        except Exception:
            kpis[key] = 0

    return {
        "date": datetime.now().isoformat(),
        "kpis": kpis,
        "insights": [
            f"📊 {int(kpis.get('total_clients', 0))} clients dans la base",
            f"💰 Prime moyenne : {kpis.get('avg_prime', 0):.2f} DT",
            f"⚠️ Taux de retard : {kpis.get('retard_rate', 0):.2f}%",
            f"🛡️ {int(kpis.get('fraude_suspecte', 0))} clients suspects"
        ]
    }


def get_segment_distribution():
    """Distribution des segments par tranche d'âge (schéma v2)"""
    query = text("""
        SELECT
            CASE
                WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 25 THEN 'Jeune'
                WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) BETWEEN 25 AND 45 THEN 'Famille'
                WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) BETWEEN 46 AND 60 THEN 'Professionnel'
                ELSE 'Senior'
            END AS segment,
            COUNT(*) AS nombre,
            ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS pourcentage
        FROM client
        GROUP BY segment
    """)
    df = pd.read_sql(query, engine)
    return df.to_dict(orient="records")


def analyze_sinistres_by_segment():
    """Analyse détaillée des sinistres par segment (schéma v2 : claim -> policy -> client)"""
    query = text("""
        WITH client_segments AS (
            SELECT
                c.id AS client_id,
                CASE
                    WHEN TIMESTAMPDIFF(YEAR, c.birth_date, CURDATE()) < 25 THEN 'Jeune'
                    WHEN TIMESTAMPDIFF(YEAR, c.birth_date, CURDATE()) BETWEEN 25 AND 45 THEN 'Famille'
                    WHEN TIMESTAMPDIFF(YEAR, c.birth_date, CURDATE()) BETWEEN 46 AND 60 THEN 'Professionnel'
                    ELSE 'Senior'
                END AS segment
            FROM client c
        ),
        claims_with_client AS (
            SELECT cl.id AS claim_id, cl.amount, p.client_id
            FROM claim cl
            JOIN policy p ON p.id = cl.policy_id
        )
        SELECT
            cs.segment,
            COUNT(cw.claim_id) AS nombre_sinistres,
            ROUND(AVG(cw.amount), 2) AS montant_moyen,
            ROUND(SUM(cw.amount), 2) AS montant_total,
            COUNT(DISTINCT cs.client_id) AS clients_concernes,
            ROUND(COUNT(cw.claim_id) * 100.0 / SUM(COUNT(cw.claim_id)) OVER (), 1) AS pourcentage
        FROM client_segments cs
        LEFT JOIN claims_with_client cw ON cw.client_id = cs.client_id
        GROUP BY cs.segment
        ORDER BY nombre_sinistres DESC
    """)

    df = pd.read_sql(query, engine)

    result = {
        "sinistres_par_segment": df.to_dict(orient="records"),
        "insights": []
    }

    for _, row in df.iterrows():
        result["insights"].append(
            f"{row['segment']}: {int(row['nombre_sinistres'])} sinistres ({row['pourcentage']}%) - Montant moyen {row['montant_moyen']} DT"
        )

    return result


def analyze_data():
    """Analyse complète pour le dashboard"""
    return {
        "global_kpis": get_global_kpis(),
        "segment_distribution": get_segment_distribution(),
        "sinistres_par_segment": analyze_sinistres_by_segment(),
        "last_updated": datetime.now().isoformat()
    }


if __name__ == "__main__":
    result = analyze_data()
    print("📈 DATA ANALYST REPORT")
    print(json.dumps(result, indent=2, ensure_ascii=False))