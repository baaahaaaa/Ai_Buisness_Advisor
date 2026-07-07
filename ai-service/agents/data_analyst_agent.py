import pandas as pd
import json
import sys
from pathlib import Path
from datetime import datetime
from sqlalchemy import create_engine, text

# Ajoute le chemin parent pour les imports
sys.path.append(str(Path(__file__).parent.parent))

DB_CONFIG = {
    "host": "localhost",
    "port": 3307,
    "user": "root",
    "password": "",
    "database": "ai_business_advisor"
}

engine = create_engine(
    f"mysql+pymysql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@"
    f"{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}",
    pool_size=10,
    max_overflow=20
)


def get_global_kpis():
    """KPIs globaux"""
    queries = {
        "total_clients": "SELECT COUNT(*) as total FROM clients",
        "avg_age": "SELECT ROUND(AVG(age), 1) as avg_age FROM clients",
        "total_sinistres": "SELECT COUNT(*) as total FROM sinistres",
        "avg_prime": "SELECT ROUND(AVG(prime_actuelle), 2) as avg_prime FROM polices",
        "retard_rate": """
            SELECT ROUND(COUNT(CASE WHEN statut = 'retard' THEN 1 END) * 100.0 / COUNT(*), 2) as taux
            FROM paiements
        """,
        "fraude_suspecte": """
            SELECT COUNT(DISTINCT client_id) as total 
            FROM sinistres 
            GROUP BY client_id 
            HAVING COUNT(*) >= 3
        """
    }

    kpis = {}
    for key, q in queries.items():
        try:
            df = pd.read_sql(text(q), engine)
            kpis[key] = float(df.iloc[0, 0]) if not df.empty else 0
        except:
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
    """Distribution des segments par tranche d'âge"""
    query = text("""
        SELECT 
            CASE 
                WHEN age < 25 THEN 'Jeune'
                WHEN age BETWEEN 25 AND 45 THEN 'Famille'
                WHEN age BETWEEN 46 AND 60 THEN 'Professionnel'
                ELSE 'Senior'
            END as segment,
            COUNT(*) as nombre,
            ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as pourcentage
        FROM clients
        GROUP BY segment
    """)
    df = pd.read_sql(query, engine)
    return df.to_dict(orient="records")


def analyze_sinistres_by_segment():
    """Analyse détaillée des sinistres par segment"""
    query = text("""
        WITH client_segments AS (
            SELECT 
                c.client_id,
                CASE 
                    WHEN c.age < 25 THEN 'Jeune'
                    WHEN c.age BETWEEN 25 AND 45 THEN 'Famille'
                    WHEN c.age BETWEEN 46 AND 60 THEN 'Professionnel'
                    ELSE 'Senior'
                END as segment
            FROM clients c
        )
        SELECT 
            cs.segment,
            COUNT(s.sinistre_id) as nombre_sinistres,
            ROUND(AVG(s.montant), 2) as montant_moyen,
            ROUND(SUM(s.montant), 2) as montant_total,
            COUNT(DISTINCT cs.client_id) as clients_concernes,
            ROUND(COUNT(s.sinistre_id) * 100.0 / SUM(COUNT(s.sinistre_id)) OVER (), 1) as pourcentage
        FROM client_segments cs
        LEFT JOIN sinistres s ON cs.client_id = s.client_id
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