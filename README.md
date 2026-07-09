# 🤖 AI Business Advisor

**Système Multi-Agents Intelligent pour une compagnie d'assurance automobile**

> **Version 2** — 10 Agents Spécialisés | Architecture 5 couches | Interaction LLM

---

## 🎯 Présentation

**AI Business Advisor** est une plateforme intelligente qui aide les responsables d'une compagnie d'assurance auto à **prendre de meilleures décisions** grâce à l'analyse avancée des données clients et à un système multi-agents.

Le système analyse les profils clients, évalue les risques, propose des primes personnalisées, détecte les fraudes, et fournit des recommandations actionnables — le tout accessible via une **interface conversationnelle** (LLM).

---

## ✨ Fonctionnalités Principales

- **10 Agents Spécialisés** coordonnés par un Orchestrator
- **Analyse prédictive** du risque (XGBoost) et segmentation clients (K-Means)
- **Tarification personnalisée** et recommandations commerciales
- **Détection de fraude** et vérification de conformité
- **Agent LLM** pour poser des questions en langage naturel
- **Reporting automatique** (PDF + email)
- **Architecture modulaire** et scalable (Docker)

---

## 🧠 Les 10 Agents

| Agent                  | Rôle principal                          | Technologie     |
|------------------------|-----------------------------------------|-----------------|
| **Orchestrator**       | Coordination globale                    | Python/FastAPI  |
| **Segmentation**       | Clustering clients (K-Means)            | Scikit-Learn    |
| **Risk**               | Prédiction du risque                    | XGBoost         |
| **Pricing**            | Calcul de prime personnalisée           | Règles + ML     |
| **Recommendation**     | Offres commerciales adaptées            | Règles métier   |
| **Fraud**              | Détection de fraudes                    | Pattern analysis|
| **Compliance**         | Vérification légale & interne           | Règles          |
| **Data Analyst**       | KPIs & analyse globale                  | Python/Pandas   |
| **Reporting**          | Génération de rapports automatiques     | Python          |
| **LLM Advisor**        | Chat intelligent (langage naturel)      | OpenAI API      |

---

## 🏗️ Architecture Technique (5 Couches)

1. **Frontend** — Angular
2. **Backend** — Spring Boot (API REST + Sécurité JWT)
3. **AI Layer** — Python + FastAPI (Multi-Agents)
4. **Services Externes** — OpenAI, SendGrid, AWS S3
5. **Data Layer** — MySQL, MongoDB, Data Warehouse

---

## 🛠️ Technologies

- **Frontend**: Angular
- **Backend**: Spring Boot 3 + Java 17
- **AI/ML**: Python, FastAPI, Scikit-Learn, XGBoost, SHAP
- **LLM**: OpenAI API
- **Base de données**: MySQL, MongoDB
- **Containerisation**: Docker + docker-compose
- **Autres**: JWT, SendGrid, AWS S3

---

## 🚀 Comment lancer le projet

```bash
# Cloner le repo
git clone https://github.com/baaahaaaa/Ai_Buisness_Advisor.git
cd Ai_Buisness_Advisor

# Lancer avec Docker (recommandé)
docker-compose up --build
