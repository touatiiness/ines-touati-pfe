# Plateforme d'apprentissage intelligente - Projet PFE

[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Ready-blue)](https://kubernetes.io/)
[![CI/CD](https://img.shields.io/badge/CI/CD-Jenkins%20%7C%20GitHub%20Actions-green)](https://www.jenkins.io/)

## 📁 Structure du projet

```
pfe v2/
├── frontend/           # Application Angular
├── backend/
│   ├── back-spring/   # Backend Spring Boot (API principale, authentification, BDD)
│   └── back-python/   # Backend Python FastAPI (IA, recommandations, quiz)
├── k8s/               # Manifests Kubernetes
├── monitoring/        # Prometheus + Grafana
├── scripts/           # Scripts de déploiement
├── docker-compose.yml # Orchestration Docker
└── README.md
```

---

## 🚀 Installation et démarrage

### 🐳 **Démarrage rapide avec Docker** (Recommandé)

```bash
# 1. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs (DB password, JWT secret, OpenAI API key)

# 2. Démarrer tous les services
docker-compose up -d

# 3. Vérifier le status
docker-compose ps

# 4. Accéder à l'application
# Frontend: http://localhost
# Backend Spring: http://localhost:8080
# Backend Python: http://localhost:8001
```

**📚 Documentation DevOps complète** : Voir [README_DEVOPS.md](README_DEVOPS.md)

---

### 💻 **Installation manuelle** (Développement)

### 1️⃣ Frontend (Angular)

```bash
cd frontend
npm install
ng serve
```

L'application sera accessible sur : **http://localhost:4200**

---

### 2️⃣ Backend Spring Boot

```bash
cd backend/back-spring
./mvnw spring-boot:run
```

API accessible sur : **http://localhost:8080**

**Base de données** : MySQL (anosdb)
- Voir `create_anosdb.sql` pour la création de la base
- Les utilisateurs sont initialisés automatiquement au démarrage

---

### 3️⃣ Backend Python (FastAPI)

```bash
cd backend/back-python

# Créer un environnement virtuel
python -m venv env
source env/bin/activate  # Sur Windows: env\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Lancer le serveur
python main.py
```

API accessible sur : **http://localhost:8001**

**Important** : Le fichier `.env` contient la clé OpenAI API nécessaire pour les fonctionnalités IA.

---

## 👥 Utilisateurs par défaut

**Mot de passe pour tous** : `123456`

### Étudiants :
- Username: `422001` (Benali Ahmed)
- Username: `270002` (Trabelsi Sami)
- Username: `783003` (Khlifi Mariem)

### Enseignant :
- Username: `PROF001` (Khalil Fatma)

---

## 🔧 Configuration

### Frontend → Backend
Les URLs des backends sont configurées dans `frontend/src/app/services/`

### Backend Python
- Le fichier `.env` contient la clé OpenAI
- Le dossier `Support_Cours_Préparation/` contient tous les cours

### Backend Spring
- Configuration BDD dans `src/main/resources/application.properties`
- Initialisation des données : `DataInitializer.java`

---

## 📚 Documentation

### Documentation DevOps (Nouveau!)
- **[README_DEVOPS.md](README_DEVOPS.md)** - 🚀 **START HERE** - Guide de démarrage rapide DevOps
- **[DEVOPS.md](DEVOPS.md)** - Guide DevOps complet (Installation, CI/CD, K8s, Monitoring)
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Checklist de déploiement étape par étape
- **[ARCHITECTURE_DEVOPS.md](ARCHITECTURE_DEVOPS.md)** - Diagrammes d'architecture
- **[FILES_CREATED.md](FILES_CREATED.md)** - Liste complète des fichiers DevOps

### Documentation Application
- **GUIDE_INSTALLATION.md** - Instructions détaillées d'installation
- **EXPLICATION_SYSTEME_RECOMMENDATIONS.md** - Système de recommandations IA
- **INSTRUCTIONS_LOGIN_STUDENT_ID.md** - Système d'authentification

---

## 🛠️ Technologies utilisées

### Frontend
- Angular 15.2.0
- TypeScript 4.9.4
- Bootstrap 5.3.3
- Nginx (reverse proxy)

### Backend Spring
- Spring Boot 2.7.18
- Java 17
- Spring Security + JWT
- JPA / Hibernate
- MySQL 8.0

### Backend Python
- Python 3.11
- FastAPI
- OpenAI GPT-4
- PyTorch + torch-geometric (GCN)
- NetworkX (graphes de connaissances)
- Python-PPTX / Python-DOCX (extraction quiz)

### DevOps
- Docker & Docker Compose
- Kubernetes
- Jenkins & GitHub Actions (CI/CD)
- Prometheus + Grafana (Monitoring)
- Trivy (Security scanning)
- Nginx Ingress Controller
- cert-manager (SSL/TLS)

---

## 🔄 CI/CD Pipeline

Ce projet inclut des pipelines CI/CD complets :

- **Jenkins** : Build, test, scan, deploy automatique
- **GitHub Actions** : Workflow automatisé sur push/PR

Voir [DEVOPS.md](DEVOPS.md) pour la configuration.

---

## 📊 Monitoring

Stack de monitoring inclus avec :
- **Prometheus** - Collecte de métriques
- **Grafana** - Dashboards et visualisation
- **Alertmanager** - Alertes email
- 10+ alertes pré-configurées

```bash
# Lancer le monitoring
docker-compose -f docker-compose.monitoring.yml up -d

# Accès Grafana: http://localhost:3000 (admin/admin123)
```

---

## 🚀 Déploiement Production

### Kubernetes
```bash
# Déploiement complet sur K8s
chmod +x scripts/k8s-deploy.sh
./scripts/k8s-deploy.sh deploy
```

### Docker Compose
```bash
# Déploiement avec backup et rollback
chmod +x scripts/deploy.sh
./scripts/deploy.sh prod deploy
```

Voir [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) pour la checklist complète.
