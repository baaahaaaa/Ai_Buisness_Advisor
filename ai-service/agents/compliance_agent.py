# Règles de conformité métier (constantes réglementaires simulées)
PRIME_MINIMALE = 300
PRIME_MAXIMALE = 3000
AGE_MINIMUM_ASSURABLE = 18
VARIATION_MAX_AUTORISEE_PCT = 40


def check_compliance(client_id: int, age: int, prime_recommandee: float,
                      prime_actuelle: float, fraude_suspecte: bool) -> dict:
    """Vérifie que la décision finale respecte les règles de conformité."""
    violations = []
    statut = "Validé"

    # Règle 1 : âge minimum
    if age and age < AGE_MINIMUM_ASSURABLE:
        violations.append(f"Client sous l'âge minimum assurable ({AGE_MINIMUM_ASSURABLE} ans)")

    # Règle 2 : prime dans les bornes autorisées
    if prime_recommandee < PRIME_MINIMALE:
        violations.append(f"Prime recommandée inférieure au minimum autorisé ({PRIME_MINIMALE} DT)")
    if prime_recommandee > PRIME_MAXIMALE:
        violations.append(f"Prime recommandée supérieure au maximum autorisé ({PRIME_MAXIMALE} DT)")

    # Règle 3 : variation trop brutale
    if prime_actuelle and prime_actuelle > 0:
        variation_pct = abs((prime_recommandee - prime_actuelle) / prime_actuelle) * 100
        if variation_pct > VARIATION_MAX_AUTORISEE_PCT:
            violations.append(
                f"Variation de prime trop importante ({round(variation_pct,1)}%, max autorisé {VARIATION_MAX_AUTORISEE_PCT}%)"
            )

    # Règle 4 : fraude
    if fraude_suspecte:
        violations.append("Dossier bloqué : fraude suspectée, validation manuelle requise")

    if violations:
        statut = "Nécessite validation manuelle"

    return {
        "client_id": client_id,
        "statut_conformite": statut,
        "violations": violations if violations else ["Aucune violation - conforme"]
    }