def explain_risk(shap_values):

    explanations=[]

    labels={

        "age":("l'âge","augmente","réduit"),

        "anciennete_annees":("l'ancienneté","augmente","réduit"),

        "puissance_vehicule":("la puissance du véhicule","augmente","réduit"),

        "km_annuel":("le kilométrage annuel","augmente","réduit"),

        "nb_sinistres":("le nombre de sinistres","augmente","réduit"),

        "nb_retards":("les retards de paiement","augmentent","réduisent")

    }

    for feature,value in shap_values.items():

        if abs(value)<0.5:
            continue

        texte,verbe_plus,verbe_moins=labels.get(
            feature,
            (feature,"augmente","réduit")
        )

        if value>0:

            explanations.append(
                f"{texte} {verbe_plus} le risque (+{abs(value):.2f})"
            )

        else:

            explanations.append(
                f"{texte} {verbe_moins} le risque (-{abs(value):.2f})"
            )

    explanations.sort()

    return explanations