import pandas as pd
import numpy as np
import os
from sqlalchemy import create_engine, text
from xgboost import XGBRegressor
import joblib

DB_CONFIG = {
    "host": "localhost", "port": 3307,
    "user": "root", "password": "",
    "database": "ai_business_advisor"
}

# Engine performant
engine = create_engine(
    f"mysql+pymysql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@"
    f"{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}",
    pool_size=10, max_overflow=20
)

MODEL_PATH = "models/risk_xgboost.pkl"


def load_risk_features():
    query = text("""
        SELECT 
            c.client_id, 
            c.age, 
            c.anciennete_annees, 
            c.puissance_vehicule, 
            c.km_annuel,
            COUNT(DISTINCT s.sinistre_id) AS nb_sinistres,
            COALESCE(SUM(CASE WHEN p.statut = 'retard' THEN 1 ELSE 0 END), 0) AS nb_retards
        FROM clients c
        LEFT JOIN sinistres s ON c.client_id = s.client_id
        LEFT JOIN paiements p ON c.client_id = p.client_id
        GROUP BY c.client_id, c.age, c.anciennete_annees, c.puissance_vehicule, c.km_annuel
    """)
    df = pd.read_sql(query, engine)
    return df


def compute_heuristic_risk(df):
    risk = (
        df["nb_sinistres"] * 15 +
        df["nb_retards"] * 8 +
        (df["km_annuel"] / 1000) * 0.8 +
        np.where(df["age"] < 25, 15, 0) +
        np.where(df["anciennete_annees"] < 2, 10, 0)
    )
    noise = np.random.normal(0, 3, size=len(df))
    risk = np.clip(risk + noise, 0, 100)
    return risk


def train_risk_model():
    df = load_risk_features()
    df["risk_target"] = compute_heuristic_risk(df)

    X = df[["age", "anciennete_annees", "puissance_vehicule", "km_annuel", "nb_sinistres", "nb_retards"]]
    y = df["risk_target"]

    model = XGBRegressor(n_estimators=100, max_depth=4, learning_rate=0.1, random_state=42)
    model.fit(X, y)

    os.makedirs("models", exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print("✅ Modèle de risque XGBoost entraîné et sauvegardé.")
    return model


def get_risk_score(client_id: int) -> dict:
    if not os.path.exists(MODEL_PATH):
        model = train_risk_model()
    else:
        model = joblib.load(MODEL_PATH)

    df = load_risk_features()
    client_row = df[df["client_id"] == client_id]

    if client_row.empty:
        return {"error": "client introuvable"}

    X = client_row[["age", "anciennete_annees", "puissance_vehicule", "km_annuel", "nb_sinistres", "nb_retards"]]
    score = float(model.predict(X)[0])

    return {
        "client_id": client_id,
        "score_risque": round(score, 2),
        "nb_sinistres": int(client_row["nb_sinistres"].values[0]),
        "nb_retards": int(client_row["nb_retards"].values[0])
    }