import pandas as pd
from sqlalchemy import create_engine, text

DB_CONFIG = {
    "host": "localhost",
    "port": 3307,
    "user": "root",
    "password": "",
    "database": "ai_business_advisor"
}

engine = create_engine(
    f"mysql+pymysql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@"
    f"{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}"
)

def analyze_data():
    print("📊 === STATISTIQUES GLOBALES ===\n")

    # Nombre de clients
    df_clients = pd.read_sql("SELECT COUNT(*) as total FROM clients", engine)
    print(f"Nombre total de clients : {df_clients['total'].iloc[0]}")

    # Statistiques par âge
    query_age = """
        SELECT 
            AVG(age) as age_moyen,
            MIN(age) as age_min,
            MAX(age) as age_max,
            COUNT(CASE WHEN age < 25 THEN 1 END) as jeunes,
            COUNT(CASE WHEN age BETWEEN 25 AND 50 THEN 1 END) as adultes,
            COUNT(CASE WHEN age > 50 THEN 1 END) as seniors
        FROM clients
    """
    stats_age = pd.read_sql(query_age, engine)
    print(f"Âge moyen : {stats_age['age_moyen'].iloc[0]:.1f} ans")

    # Sinistres
    query_sin = """
        SELECT 
            COUNT(*) as total_sinistres,
            AVG(montant) as montant_moyen,
            MAX(montant) as montant_max
        FROM sinistres
    """
    stats_sin = pd.read_sql(query_sin, engine)
    print(f"Nombre total de sinistres : {stats_sin['total_sinistres'].iloc[0]}")
    print(f"Montant moyen d'un sinistre : {stats_sin['montant_moyen'].iloc[0]:.2f} DT")

    # Primes
    query_prime = """
        SELECT 
            AVG(prime_actuelle) as prime_moyenne,
            MIN(prime_actuelle) as prime_min,
            MAX(prime_actuelle) as prime_max
        FROM polices
    """
    stats_prime = pd.read_sql(query_prime, engine)
    print(f"Prime moyenne : {stats_prime['prime_moyenne'].iloc[0]:.2f} DT")

    # Taux de retard
    query_retard = """
        SELECT 
            COUNT(CASE WHEN statut = 'retard' THEN 1 END) * 100.0 / COUNT(*) as taux_retard_pct
        FROM paiements
    """
    stats_retard = pd.read_sql(query_retard, engine)
    print(f"Taux de retard de paiement : {stats_retard['taux_retard_pct'].iloc[0]:.2f}%")

    print("\n✅ Analyse terminée !")

if __name__ == "__main__":
    analyze_data()