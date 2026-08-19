def compute_confidence(
    segmentation,
    risk,
    pricing,
    fraud,
    compliance
):
    score = 0

    # Segmentation
    if segmentation.get("segment") is not None:
        score += 20

    # Risk
    risk_score = risk.get("score_risque")

    if risk_score is not None and 0 <= risk_score <= 100:
        score += 20

    # Pricing
    if pricing.get("prime_recommandee", 0) > 0:
        score += 15

    # Fraud
    if fraud.get("fraude_suspecte") is False:
        score += 20
    else:
        score += 10

    # Compliance
    if compliance.get("statut_conformite") == "Validé":
        score += 15
    else:
        score += 5

    # Explainability
    if len(risk.get("explication_textuelle", [])) > 0:
        score += 10
    else:
        score += 5

    if score > 100:
        score = 100

    if score >= 90:
        level = "Très élevé"
    elif score >= 75:
        level = "Élevé"
    elif score >= 60:
        level = "Moyen"
    else:
        level = "Faible"

    return {
        "score": score,
        "niveau": level
    }