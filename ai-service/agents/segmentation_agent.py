import pandas as pd
import os
from sqlalchemy import create_engine, text
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import joblib

DB_CONFIG = {
    "host": "localhost",
    "port": 3307,
    "user": "root",
    "password": "",
    "database": "ai_business_advisor"
}

# SQLAlchemy Engine (réutilisable + performant)
engine = create_engine(
    f"mysql+pymysql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@"
    f"{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}",
    pool_size=10,
    max_overflow=20
)

MODEL_PATH = "models/segmentation_kmeans.pkl"
SCALER_PATH = "models/segmentation_scaler.pkl"


def load_clients_data():
    """Requête optimisée"""
    query = text("""
        SELECT 
            c.client_id, 
            c.age, 
            c.anciennete_annees, 
            c.puissance_vehicule, 
            c.km_annuel,
            COUNT(s.sinistre_id) AS nb_sinistres
        FROM clients c
        LEFT JOIN sinistres s ON c.client_id = s.client_id
        GROUP BY c.client_id, c.age, c.anciennete_annees, c.puissance_vehicule, c.km_annuel
    """)
    df = pd.read_sql(query, engine)
    return df


def train_segmentation_model():
    df = load_clients_data()
    features = df[["age", "anciennete_annees", "puissance_vehicule", "km_annuel", "nb_sinistres"]]

    scaler = StandardScaler()
    X = scaler.fit_transform(features)

    kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
    kmeans.fit(X)

    os.makedirs("models", exist_ok=True)
    joblib.dump(kmeans, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)

    print("✅ Modèle de segmentation entraîné et sauvegardé.")
    return kmeans, scaler


def get_segment(client_id: int) -> dict:
    if not (os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH)):
        kmeans, scaler = train_segmentation_model()
    else:
        kmeans = joblib.load(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)

    df = load_clients_data()
    client_row = df[df["client_id"] == client_id]

    if client_row.empty:
        return {"error": "client introuvable"}

    features = client_row[["age", "anciennete_annees", "puissance_vehicule", "km_annuel", "nb_sinistres"]]
    X = scaler.transform(features)
    cluster_id = int(kmeans.predict(X)[0])

    cluster_names = {0: "Famille", 1: "Jeune", 2: "Professionnel", 3: "Senior"}

    return {
        "client_id": client_id,
        "segment_predit": cluster_names.get(cluster_id, "Inconnu"),
        "nb_sinistres": int(client_row["nb_sinistres"].values[0])
    }