"""
Import du dataset Kaggle vers le schema MySQL v2.
"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

import random
from datetime import date, timedelta
from config import DB_CONFIG
import mysql.connector
import pandas as pd
from faker import Faker

fake = Faker("fr_FR")

CSV_PATH = "data/insurance_policyholder_churn_synthetic.csv"
VALIDATION_EXPORT_PATH = "data/churn_labels_for_validation.csv"

VEHICLE_BRANDS = ["Peugeot", "Renault", "Volkswagen", "Toyota", "Hyundai", "Kia", "Fiat"]
POWER_RANGE = (60, 200)
KM_ANNUEL_RANGE = (3000, 30000)
CLAIM_TYPES = ["collision", "vol", "bris_glace", "incendie", "autre"]


def load_auto_policyholders():
    df = pd.read_csv(CSV_PATH)
    auto = df[df["policy_type"] == "Auto"].copy()
    print(f"{len(auto)} clients Auto charges depuis le CSV (sur {len(df)} au total).")
    return auto


def random_plate(i):
    return f"{100 + (i % 900)}TU{1000 + i}"


def import_row(cursor, row, i):
    as_of_date = date.fromisoformat(str(row["as_of_date"]))
    age = int(row["age"])
    tenure_months = int(row["customer_tenure_months"])
    birth_date = as_of_date.replace(year=as_of_date.year - age)

    cursor.execute(
        """
        INSERT INTO client (first_name, last_name, gender, birth_date, phone, email, address)
        VALUES (%s,%s,%s,%s,%s,%s,%s)
        """,
        (
            fake.first_name(),
            fake.last_name(),
            random.choice(["M", "F"]),
            birth_date,
            fake.phone_number()[:30],
            fake.unique.email(),
            fake.address().replace("\n", ", "),
        ),
    )
    client_id = cursor.lastrowid

    cursor.execute(
        """
        INSERT INTO vehicle (client_id, brand, model, year, power, annual_mileage, plate_number)
        VALUES (%s,%s,%s,%s,%s,%s,%s)
        """,
        (
            client_id,
            random.choice(VEHICLE_BRANDS),
            fake.word().capitalize(),
            random.randint(2010, 2024),
            random.randint(*POWER_RANGE),
            random.randint(*KM_ANNUEL_RANGE),
            random_plate(i),
        ),
    )
    vehicle_id = cursor.lastrowid

    premium = float(row["current_premium"])
    start_date = as_of_date - timedelta(days=tenure_months * 30)
    policy_number = f"POL-{client_id:06d}-{random.randint(100,999)}"
    cursor.execute(
        """
        INSERT INTO policy (client_id, vehicle_id, policy_number, start_date, end_date, premium, status)
        VALUES (%s,%s,%s,%s,%s,%s,%s)
        """,
        (client_id, vehicle_id, policy_number, start_date, start_date + timedelta(days=365),
         round(premium, 2), "ACTIVE"),
    )
    policy_id = cursor.lastrowid

    nb_claims = int(row["num_claims_12m"])
    nb_approved = int(row["num_approved_claims_12m"]) if "num_approved_claims_12m" in row else 0
    nb_rejected = int(row["num_rejected_claims_12m"]) if "num_rejected_claims_12m" in row else 0
    avg_claim = float(row["avg_claim_amount"]) if row["avg_claim_amount"] > 0 else 500.0

    statuses = (["APPROVED"] * nb_approved) + (["REJECTED"] * nb_rejected)
    statuses += ["PENDING"] * max(0, nb_claims - len(statuses))
    statuses = statuses[:nb_claims]
    random.shuffle(statuses)

    for j in range(nb_claims):
        jours_avant = random.randint(0, 365)
        montant = max(50.0, round(random.gauss(avg_claim, avg_claim * 0.25), 2))
        cursor.execute(
            """
            INSERT INTO claim (policy_id, claim_date, amount, claim_type, status)
            VALUES (%s,%s,%s,%s,%s)
            """,
            (policy_id, as_of_date - timedelta(days=jours_avant), montant,
             random.choice(CLAIM_TYPES), statuses[j] if j < len(statuses) else "PENDING"),
        )

    is_monthly = str(row["payment_frequency"]).lower().startswith("month")
    nb_paiements = 12 if is_monthly else 1
    montant_paiement = round(premium / nb_paiements, 2)

    nb_retards = min(int(row["late_payment_count_12m"]), nb_paiements)
    nb_impayes = 1 if int(row["missed_payment_flag"]) == 1 and nb_paiements > nb_retards else 0
    nb_payes = nb_paiements - nb_retards - nb_impayes

    statuts = (["LATE"] * nb_retards) + (["UNPAID"] * nb_impayes) + (["PAID"] * max(0, nb_payes))
    random.shuffle(statuts)

    for j, statut in enumerate(statuts):
        jours_avant = int(365 * (j + 1) / max(1, nb_paiements))
        late_days = random.randint(5, 30) if statut == "LATE" else 0
        cursor.execute(
            """
            INSERT INTO payment (policy_id, payment_date, amount, status, late_days)
            VALUES (%s,%s,%s,%s,%s)
            """,
            (policy_id, as_of_date - timedelta(days=jours_avant), montant_paiement, statut, late_days),
        )

    return client_id, float(row["churn_flag"])


def main():
    df = load_auto_policyholders()

    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()

    validation_rows = []
    for i, (_, row) in enumerate(df.iterrows()):
        client_id, churn_flag = import_row(cursor, row, i)
        validation_rows.append({"client_id": client_id, "churn_flag": churn_flag})

        if i % 500 == 0:
            print(f"{i} clients importes...")
            conn.commit()

    conn.commit()
    cursor.close()
    conn.close()

    pd.DataFrame(validation_rows).to_csv(VALIDATION_EXPORT_PATH, index=False)
    print(f"{len(df)} clients Auto importes avec succes (schema v2).")
    print(f"Labels churn exportes pour validation future : {VALIDATION_EXPORT_PATH}")


if __name__ == "__main__":
    main()
