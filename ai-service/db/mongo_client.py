from pymongo import MongoClient
from datetime import datetime

from config import MONGO_URI, MONGO_DB_NAME

client = MongoClient(MONGO_URI)
db = client[MONGO_DB_NAME]
chat_history_collection = db["chat_history"]


def save_chat_message(client_id: int, question: str, answer: str, success: bool = True):
    """Sauvegarde un échange question/réponse du LLM Advisor."""
    document = {
        "client_id": client_id,
        "question": question,
        "answer": answer,
        "success": success,
        "timestamp": datetime.now()
    }
    result = chat_history_collection.insert_one(document)
    return str(result.inserted_id)


def get_chat_history(client_id: int, limit: int = 20):
    """Récupère l'historique des conversations pour un client (plus récent en premier)."""
    cursor = chat_history_collection.find(
        {"client_id": client_id}
    ).sort("timestamp", -1).limit(limit)

    history = []
    for doc in cursor:
        history.append({
            "question": doc["question"],
            "answer": doc["answer"],
            "success": doc["success"],
            "timestamp": doc["timestamp"].isoformat()
        })
    return history