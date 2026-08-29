import pandas as pd
import numpy as np
import os
from sqlalchemy import create_engine, text
from xgboost import XGBRegressor
import joblib
import shap

from config import DB_CONFIG

engine = create_engine(
    f"mysql+pymysql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@"
    f"{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}",
    pool_size=10, max_overflow=20
)

MODEL_PATH = "models/risk_xgboost.pkl"


def load_risk_features():
    query = text("""
        SELECT
            c.id AS client_id,
            TIMESTAMPDIFF(YEAR, c.birth_date, CURDATE()) AS age,
            TIMESTAMPDIFF(YEAR, p.start_date, CURDATE()) AS anciennete_annees,
            v.power AS puissance_vehicule,
            v.annual_mileage AS km_annuel,
            COALESCE(cl.nb_sinistres, 0) AS nb_sinistres,
            COALESCE(pay.nb_retards, 0) AS nb_retards
        FROM client c
        JOIN vehicle v ON v.client_id = c.id
        JOIN policy p ON p.client_id = c.id AND p.vehicle_id = v.id
        LEFT JOIN (
            SELECT policy_id, COUNT(*) AS nb_sinistres
            FROM claim
            GROUP BY policy_id
        ) cl ON cl.policy_id = p.id
        LEFT JOIN (
            SELECT policy_id, SUM(CASE WHEN status = 'LATE' THEN 1 ELSE 0 END) AS nb_retards
            FROM payment
            GROUP BY policy_id
        ) pay ON pay.policy_id = p.id
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
    print("Modele de risque XGBoost entraine et sauvegarde.")
    return model


def get_risk_score(client_id: int) -> dict:

    if not os.path.exists(MODEL_PATH):
        model = train_risk_model()
    else:
        model = joblib.load(MODEL_PATH)

    explainer = shap.TreeExplainer(model)

    df = load_risk_features()

    client_row = df[df["client_id"] == client_id]

    if client_row.empty:
        return {
            "error": "client introuvable"
        }

    X = client_row[[
        "age",
        "anciennete_annees",
        "puissance_vehicule",
        "km_annuel",
        "nb_sinistres",
        "nb_retards"
    ]]

    score = float(np.clip(model.predict(X)[0], 0, 100))
    shap_values = explainer.shap_values(X)

    importance = {}

    for feature, value in zip(X.columns, shap_values[0]):
        importance[feature] = round(float(value), 3)

    return {

        "client_id": client_id,

        "score_risque": round(score,2),

        "nb_sinistres": int(client_row["nb_sinistres"].values[0]),

        "nb_retards": int(client_row["nb_retards"].values[0]),

        "explication": importance

    }