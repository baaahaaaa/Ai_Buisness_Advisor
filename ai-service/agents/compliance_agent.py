# Regles de conformite metier (constantes reglementaires simulees)
PRIME_MINIMALE = 300
PRIME_MAXIMALE = 3000
AGE_MINIMUM_ASSURABLE = 18
VARIATION_MAX_AUTORISEE_PCT = 40


def check_compliance(client_id: int, age: int, prime_recommandee: float,
                      prime_actuelle: float, fraude_suspecte: bool) -> dict:
    """Verifie que la decision finale respecte les regles de conformite."""
    violations = []
    statut = "Valide"

    if age and age < AGE_MINIMUM_ASSURABLE:
        violations.append(f"Client sous l''age minimum assurable ({AGE_MINIMUM_ASSURABLE} ans)")

    if prime_recommandee < PRIME_MINIMALE:
        violations.append(f"Prime recommandee inferieure au minimum autorise ({PRIME_MINIMALE} DT)")
    if prime_recommandee > PRIME_MAXIMALE:
        violations.append(f"Prime recommandee superieure au maximum autorise ({PRIME_MAXIMALE} DT)")

    if prime_actuelle and prime_actuelle > 0:
        variation_pct = abs((prime_recommandee - prime_actuelle) / prime_actuelle) * 100
        if variation_pct > VARIATION_MAX_AUTORISEE_PCT:
            violations.append(
                f"Variation de prime trop importante ({round(variation_pct, 1)}%, max autorise {VARIATION_MAX_AUTORISEE_PCT}%)"
            )

    if fraude_suspecte:
        violations.append("Dossier bloque : fraude suspectee, validation manuelle requise")

    if violations:
        statut = "Necessite validation manuelle"

    return {
        "client_id": client_id,
        "statut_conformite": statut,
        "violations": violations
    }
