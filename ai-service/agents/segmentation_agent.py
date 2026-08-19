import pandas as pd
import os
from sqlalchemy import create_engine, text
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import joblib

from config import DB_CONFIG

engine = create_engine(
    f"mysql+pymysql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@"
    f"{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}",
    pool_size=10,
    max_overflow=20
)

MODEL_PATH = "models/segmentation_kmeans.pkl"
SCALER_PATH = "models/segmentation_scaler.pkl"


def load_clients_data():
    query = text("""
        SELECT
            c.id AS client_id,
            TIMESTAMPDIFF(YEAR, c.birth_date, CURDATE()) AS age,
            TIMESTAMPDIFF(YEAR, p.start_date, CURDATE()) AS anciennete_annees,
            v.power AS puissance_vehicule,
            v.annual_mileage AS km_annuel,
            COALESCE(cl.nb_sinistres, 0) AS nb_sinistres
        FROM client c
        JOIN vehicle v ON v.client_id = c.id
        JOIN policy p ON p.client_id = c.id AND p.vehicle_id = v.id
        LEFT JOIN (
            SELECT policy_id, COUNT(*) AS nb_sinistres
            FROM claim
            GROUP BY policy_id
        ) cl ON cl.policy_id = p.id
    """)
    df = pd.read_sql(query, engine)
    return df


def train_segmentation_model():
    df = load_clients_data()
    features = df[["age", "anciennete_annees", "puissance_vehicule", "km_annuel", "nb_sinistres"]]

    scaler = StandardScaler()
    X = scaler.fit_transform(features)

    kmeans = KMeans(n_clusters=5, random_state=42, n_init=10)
    kmeans.fit(X)

    os.makedirs("models", exist_ok=True)
    joblib.dump(kmeans, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)

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

    return {
        "client_id": client_id,
        "segment": cluster_id,
        "age": int(client_row["age"].values[0]),
        "anciennete": int(client_row["anciennete_annees"].values[0]),
        "nb_sinistres": int(client_row["nb_sinistres"].values[0])
    }