def compute_confidence(
    segmentation,
    risk,
    pricing,
    fraud,
    compliance
):
    score = 0

    # =====================================================
    # SEGMENTATION
    # =====================================================

    if segmentation.get("segment") is not None:
        score += 20

    # =====================================================
    # RISQUE
    # =====================================================

    risk_score = risk.get("score_risque")

    if risk_score is not None and 0 <= risk_score <= 100:
        score += 20

    # =====================================================
    # PRICING
    # =====================================================

    if pricing.get("prime_recommandee", 0) > 0:
        score += 15

    # =====================================================
    # FRAUDE
    # =====================================================

    if fraud.get("fraude_suspecte") is False:
        score += 20
    else:
        score += 10

    # =====================================================
    # COMPLIANCE
    # =====================================================

    compliance_status = compliance.get("statut_conformite", "")

    if compliance_status == "Valide":
        score += 15
    else:
        score += 5

    # =====================================================
    # EXPLAINABILITY
    # =====================================================

    if len(risk.get("explication_textuelle", [])) > 0:
        score += 10
    else:
        score += 5

    # =====================================================
    # SECURITE
    # =====================================================

    if score > 100:
        score = 100

    # =====================================================
    # NIVEAU
    # =====================================================

    if score >= 90:
        level = "Tres eleve"

    elif score >= 75:
        level = "Eleve"

    elif score >= 60:
        level = "Moyen"

    else:
        level = "Faible"

    return {
        "score": score,
        "niveau": level
    }