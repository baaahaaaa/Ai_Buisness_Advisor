from faker import Faker
import random
import mysql.connector
from datetime import date, timedelta

fake = Faker('fr_FR')
NB_CLIENTS = 5000   # tnajem tzid l 10000, 50000...

conn = mysql.connector.connect(
    host="localhost",
    port=3307,
    user="root",
    password="",
    database="ai_business_advisor"
)

cursor = conn.cursor()

villes = ["Tunis", "Sfax", "Sousse", "Nabeul", "Bizerte", "Gabès", "Kairouan"]

for i in range(NB_CLIENTS):
    nom = fake.last_name()
    prenom = fake.first_name()
    age = random.randint(18, 70)
    anciennete = random.randint(0, 25)
    puissance = random.randint(60, 200)
    km_annuel = random.randint(3000, 30000)
    ville = random.choice(villes)
    date_inscription = fake.date_between(start_date='-10y', end_date='today')

    cursor.execute("""
        INSERT INTO clients (nom, prenom, age, date_inscription, anciennete_annees,
                              puissance_vehicule, km_annuel, ville)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
    """, (nom, prenom, age, date_inscription, anciennete, puissance, km_annuel, ville))

    client_id = cursor.lastrowid

    # sinistres aléatoires (0 à 3 par client)
    for _ in range(random.randint(0, 3)):
        cursor.execute("""
            INSERT INTO sinistres (client_id, date_sinistre, montant, type_sinistre)
            VALUES (%s,%s,%s,%s)
        """, (client_id, fake.date_between(start_date='-5y', end_date='today'),
              round(random.uniform(200, 5000), 2),
              random.choice(["collision","vol","bris_glace","incendie"])))

    # prime + police
    prime = round(random.uniform(500, 2000), 2)
    cursor.execute("""
        INSERT INTO polices (client_id, prime_actuelle, date_debut, date_fin)
        VALUES (%s,%s,%s,%s)
    """, (client_id, prime, date_inscription, date_inscription + timedelta(days=365)))

# paiements (1 à 4 par client, avec statut)
    for _ in range(random.randint(1, 4)):
        statut = random.choices(["paye","retard","impaye"], weights=[80,15,5])[0]
        cursor.execute("""
            INSERT INTO paiements (client_id, date_paiement, montant, statut)
            VALUES (%s,%s,%s,%s)
        """, (client_id, fake.date_between(start_date='-3y', end_date='today'),
              round(random.uniform(400, 1500), 2), statut))
    if i % 500 == 0:
        print(f"{i} clients insérés...")
        conn.commit()

conn.commit()
cursor.close()
conn.close()
print(f"✅ {NB_CLIENTS} clients générés avec succès.")