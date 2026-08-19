import json
import sys
from pathlib import Path
from datetime import datetime

# Ajoute le chemin parent
sys.path.append(str(Path(__file__).parent.parent))

from agents.data_analyst_agent import analyze_data
from agents.llm_advisor_agent import ask_llm_advisor
from agents.context_builder import build_client_context
from agents.pdf_generator import build_report_pdf


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
        # Analyse spécifique client (segmentation, risque, pricing, ...)
        context = build_client_context(client_id)
        report["client_analysis"] = context

        # Recommandations stratégiques via LLM
        try:
            llm_response = ask_llm_advisor({**context})
            report["executive_summary"] = llm_response.get("resume", "Résumé non disponible")
        except Exception as e:
            print(f"Erreur LLM (reporting_agent) : {e}")
            report["executive_summary"] = "Analyse LLM temporairement indisponible"

    if format_type == "json":
        return report
    else:
        return json.dumps(report, indent=2, ensure_ascii=False, default=str)


def generate_report_pdf(client_id: int = None) -> bytes:
    """Génère le rapport (client ou global) et le rend en PDF (bytes)."""
    report = generate_report(client_id, format_type="json")
    return build_report_pdf(report)


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