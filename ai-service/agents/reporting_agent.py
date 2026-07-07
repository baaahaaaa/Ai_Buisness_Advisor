import json
import sys
from pathlib import Path
from datetime import datetime

# Ajoute le chemin parent
sys.path.append(str(Path(__file__).parent.parent))

from agents.data_analyst_agent import analyze_data
from agents.llm_advisor_agent import ask_llm_advisor


def generate_report(client_id: int = None, format_type: str = "json"):
    """Génère un rapport complet"""
    
    report = {
        "report_id": f"RAP-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
        "generated_at": datetime.now().isoformat(),
        "type": "Rapport Global" if client_id is None else f"Rapport Client {client_id}",
    }

    # KPIs globaux
    if client_id is None:
        report["global_analysis"] = analyze_data()
    else:
        # Analyse spécifique client
        from agents.llm_advisor_agent import build_context
        context = build_context(client_id)
        report["client_analysis"] = context

    # Recommandations stratégiques via LLM
    if client_id:
        try:
            llm_response = ask_llm_advisor(client_id, "Génère un résumé exécutif pour ce client")
            report["executive_summary"] = llm_response.get("answer", "Résumé non disponible")
        except:
            report["executive_summary"] = "Analyse LLM temporairement indisponible"

    if format_type == "json":
        return report
    else:
        return json.dumps(report, indent=2, ensure_ascii=False, default=str)


def save_report(client_id: int = None):
    """Sauvegarde le rapport dans un fichier"""
    report = generate_report(client_id)
    filename = f"reports/report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    
    import os
    os.makedirs("reports", exist_ok=True)
    
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False, default=str)
    
    print(f"✅ Rapport sauvegardé : {filename}")
    return filename


if __name__ == "__main__":
    print("📄 Génération du rapport global...")
    report = generate_report()
    print(json.dumps(report, indent=2, ensure_ascii=False, default=str))