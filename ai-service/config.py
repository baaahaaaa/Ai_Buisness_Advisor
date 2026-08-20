"""
Configuration centralisée du service IA — variables d'environnement.

Toutes les valeurs peuvent être surchargées par variable d'environnement
(c'est ce que fait docker-compose.yml pour le conteneur ai-service).
Les valeurs par défaut ci-dessous ne s'appliquent qu'en dev LOCAL, hors
Docker : c'est pour ça qu'elles pointent vers localhost et le port MySQL
exposé côté host (3307).
"""
import os
from dotenv import load_dotenv

load_dotenv()

# --- MySQL ---
MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3307"))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "ai_business_advisor")

DB_CONFIG = {
    "host": MYSQL_HOST,
    "port": MYSQL_PORT,
    "user": MYSQL_USER,
    "password": MYSQL_PASSWORD,
    "database": MYSQL_DATABASE,
}

# --- MongoDB ---
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "ai_business_advisor_mongo")

# --- LLM (Ollama) ---
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.1:8b")
# --- JWT (partage le meme secret que le backend Spring Boot) ---
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not JWT_SECRET_KEY:
    raise RuntimeError("JWT_SECRET_KEY manquant - a definir dans .env / docker-compose")
