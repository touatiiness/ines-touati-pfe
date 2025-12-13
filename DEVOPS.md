# 🚀 DevOps Documentation - PFE Application

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Installation locale avec Docker](#installation-locale-avec-docker)
4. [CI/CD Pipelines](#cicd-pipelines)
5. [Déploiement Kubernetes](#déploiement-kubernetes)
6. [Monitoring](#monitoring)
7. [Sécurité](#sécurité)
8. [Troubleshooting](#troubleshooting)

---

## Vue d'ensemble

Cette application est une plateforme d'apprentissage intelligente composée de 3 services principaux :

- **Frontend** : Angular 15 avec Nginx
- **Backend Spring** : Spring Boot 2.7.18 avec MySQL
- **Backend Python** : FastAPI avec IA (GPT-4 + GCN)

### Stack DevOps

- **Conteneurisation** : Docker, Docker Compose
- **CI/CD** : Jenkins, GitHub Actions
- **Orchestration** : Kubernetes
- **Monitoring** : Prometheus, Grafana
- **Logging** : ELK Stack (à venir)
- **Sécurité** : Trivy, SSL/TLS

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Nginx Ingress                        │
│                 (Load Balancer + SSL)                   │
└────────────────────┬────────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
   ┌──────▼──────┐      ┌──────▼───────┐
   │   Frontend  │      │   Backends   │
   │   (Angular) │      │              │
   │   + Nginx   │      ├──────────────┤
   └─────────────┘      │ Spring Boot  │
                        │   (Port 8080)│
                        ├──────────────┤
                        │ FastAPI      │
                        │   (Port 8001)│
                        └──────┬───────┘
                               │
                        ┌──────▼───────┐
                        │   MySQL 8.0  │
                        │  (Port 3306) │
                        └──────────────┘
```

---

## Installation locale avec Docker

### Prérequis

- Docker 20.10+
- Docker Compose 2.0+
- Git
- 4GB RAM minimum

### Étapes d'installation

1. **Cloner le repository**

```bash
git clone <votre-repo>
cd pfe-app
```

2. **Configurer les variables d'environnement**

```bash
cp .env.example .env
# Éditer .env avec vos valeurs
```

3. **Lancer l'application**

```bash
# Construire et démarrer tous les services
docker-compose up -d

# Vérifier le statut
docker-compose ps

# Voir les logs
docker-compose logs -f
```

4. **Accéder à l'application**

- Frontend : http://localhost
- Backend Spring : http://localhost:8080
- Backend Python : http://localhost:8001

### Commandes utiles

```bash
# Arrêter les services
docker-compose down

# Reconstruire les images
docker-compose build --no-cache

# Voir les logs d'un service spécifique
docker-compose logs -f backend-spring

# Exécuter une commande dans un conteneur
docker-compose exec backend-spring bash

# Nettoyer tout
docker-compose down -v --rmi all
```

---

## CI/CD Pipelines

### Jenkins Pipeline

Le fichier `Jenkinsfile` définit le pipeline complet :

**Étapes principales :**

1. **Checkout** - Récupération du code
2. **Build Images** - Construction parallèle des 3 images Docker
3. **Run Tests** - Tests unitaires et d'intégration
4. **Security Scan** - Scan Trivy pour vulnérabilités
5. **Push to Registry** - Push vers Docker Hub (branches main/develop)
6. **Deploy to Staging** - Déploiement automatique (branche develop)
7. **Deploy to Production** - Déploiement manuel (branche main)

**Configuration Jenkins :**

```bash
# 1. Installer les plugins requis
- Docker Pipeline
- Git
- Credentials Binding

# 2. Créer les credentials
- dockerhub-credentials : Username/Password Docker Hub
- github-token : Personal Access Token GitHub

# 3. Créer un pipeline
- New Item → Pipeline
- Pipeline script from SCM
- SCM: Git → Repository URL
- Script Path: Jenkinsfile
```

### GitHub Actions

Le workflow `.github/workflows/ci-cd.yml` s'exécute automatiquement sur push/PR.

**Jobs principaux :**

1. `build-and-test-frontend` - Build et test Angular
2. `build-and-test-backend-spring` - Build et test Spring Boot
3. `build-and-test-backend-python` - Build et test Python
4. `build-docker-images` - Construction des images Docker
5. `security-scan` - Scan de sécurité avec Trivy
6. `deploy-staging` - Déploiement staging (branche develop)
7. `deploy-production` - Déploiement production (branche main)

**Secrets GitHub requis :**

```
GITHUB_TOKEN (automatique)
```

Pour Docker Hub privé, ajouter :
```
DOCKERHUB_USERNAME
DOCKERHUB_TOKEN
```

---

## Déploiement Kubernetes

### Prérequis

- Cluster Kubernetes 1.24+
- kubectl configuré
- Helm 3+ (optionnel)

### Déploiement rapide

```bash
# Utiliser le script de déploiement
chmod +x scripts/k8s-deploy.sh
./scripts/k8s-deploy.sh deploy
```

### Déploiement manuel

```bash
# 1. Créer le namespace
kubectl apply -f k8s/namespace.yaml

# 2. Déployer MySQL
kubectl apply -f k8s/mysql-deployment.yaml

# 3. Attendre que MySQL soit prêt
kubectl wait --for=condition=ready pod -l app=mysql -n pfe-app --timeout=300s

# 4. Déployer les backends
kubectl apply -f k8s/backend-spring-deployment.yaml
kubectl apply -f k8s/backend-python-deployment.yaml

# 5. Déployer le frontend
kubectl apply -f k8s/frontend-deployment.yaml

# 6. Déployer l'ingress
kubectl apply -f k8s/ingress.yaml
```

### Mise à l'échelle

```bash
# Scaler manuellement
kubectl scale deployment/backend-spring -n pfe-app --replicas=3

# L'autoscaling est configuré automatiquement (HPA)
# Min: 2, Max: 5 replicas basé sur CPU/Memory
```

### Vérification

```bash
# Status général
./scripts/k8s-deploy.sh status

# Logs
./scripts/k8s-deploy.sh logs backend-spring

# Rollback
./scripts/k8s-deploy.sh rollback backend-spring
```

---

## Monitoring

### Prometheus + Grafana

**Lancer le stack de monitoring :**

```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

**Accès :**

- Prometheus : http://localhost:9090
- Grafana : http://localhost:3000 (admin/admin123)
- Alertmanager : http://localhost:9093

**Dashboards Grafana recommandés :**

1. **Spring Boot Dashboard** - ID: 12900
2. **Node Exporter Full** - ID: 1860
3. **Docker Monitoring** - ID: 893
4. **MySQL Overview** - ID: 7362

**Import de dashboard :**

```
Grafana → Dashboards → Import → Enter ID → Select Prometheus datasource
```

### Métriques disponibles

#### Spring Boot (Actuator)
```
http://localhost:8080/actuator/metrics
http://localhost:8080/actuator/health
http://localhost:8080/actuator/prometheus
```

#### Métriques système
- CPU, Memory, Disk usage (Node Exporter)
- Container metrics (cAdvisor)
- Application metrics (Spring Boot Actuator)

### Alertes configurées

Les alertes sont définies dans `monitoring/prometheus/alerts/` :

- Service Down (Critical)
- High CPU Usage (Warning)
- High Memory Usage (Warning)
- Disk Space Low/Critical
- High HTTP Error Rate
- Database Connection Pool Exhausted
- Container Restarting

**Configuration email :**

Éditer `monitoring/alertmanager/alertmanager.yml` avec vos credentials SMTP.

---

## Sécurité

### Bonnes pratiques implémentées

✅ **Multi-stage Docker builds** - Images optimisées et sécurisées
✅ **Non-root users** - Tous les conteneurs s'exécutent avec utilisateur non-root
✅ **Secrets management** - Variables sensibles dans .env et Kubernetes Secrets
✅ **Health checks** - Toutes les images ont des health checks
✅ **Security scanning** - Trivy scan automatique dans CI/CD
✅ **HTTPS/TLS** - Configuré dans Ingress avec cert-manager
✅ **CORS** - Configuration CORS sécurisée
✅ **Resource limits** - Limites CPU/Memory dans Kubernetes

### Scan de sécurité manuel

```bash
# Scan d'une image Docker
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image votre-image:tag

# Scan du filesystem
docker run --rm \
  -v $PWD:/scan \
  aquasec/trivy fs /scan
```

### Mise à jour des secrets Kubernetes

```bash
# MySQL
kubectl create secret generic mysql-secret \
  --from-literal=root-password=NOUVEAU_PASSWORD \
  --from-literal=database=anosdb \
  --from-literal=user=pfeuser \
  --from-literal=password=NOUVEAU_PASSWORD \
  -n pfe-app --dry-run=client -o yaml | kubectl apply -f -

# Spring Boot
kubectl create secret generic backend-spring-secret \
  --from-literal=jwt-secret=NOUVEAU_JWT_SECRET \
  --from-literal=db-url=jdbc:mysql://mysql:3306/anosdb \
  --from-literal=db-username=pfeuser \
  --from-literal=db-password=NOUVEAU_PASSWORD \
  -n pfe-app --dry-run=client -o yaml | kubectl apply -f -

# Python Backend
kubectl create secret generic backend-python-secret \
  --from-literal=openai-api-key=sk-VOTRE_NOUVELLE_CLE \
  -n pfe-app --dry-run=client -o yaml | kubectl apply -f -
```

---

## Troubleshooting

### Problèmes courants

#### 1. Service ne démarre pas

```bash
# Vérifier les logs
docker-compose logs -f <service>

# En Kubernetes
kubectl logs -n pfe-app -l app=<service>

# Vérifier les events
kubectl get events -n pfe-app --sort-by='.lastTimestamp'
```

#### 2. Base de données inaccessible

```bash
# Vérifier que MySQL est en cours d'exécution
docker-compose ps mysql

# Tester la connexion
docker-compose exec mysql mysql -u root -p

# Vérifier les variables d'environnement
docker-compose exec backend-spring env | grep SPRING_DATASOURCE
```

#### 3. Erreur de build Docker

```bash
# Nettoyer le cache Docker
docker builder prune -a

# Reconstruire sans cache
docker-compose build --no-cache

# Vérifier l'espace disque
docker system df
```

#### 4. Performance lente

```bash
# Vérifier les ressources
docker stats

# En Kubernetes
kubectl top nodes
kubectl top pods -n pfe-app

# Augmenter les ressources dans docker-compose.yml
```

#### 5. Erreur de certificat SSL

```bash
# Vérifier cert-manager
kubectl get certificate -n pfe-app
kubectl describe certificate pfe-tls-cert -n pfe-app

# Forcer le renouvellement
kubectl delete certificate pfe-tls-cert -n pfe-app
kubectl apply -f k8s/ingress.yaml
```

### Debug mode

```bash
# Activer les logs Spring Boot en mode DEBUG
docker-compose exec backend-spring \
  sh -c "export LOGGING_LEVEL_ROOT=DEBUG && java -jar app.jar"

# Mode verbose Docker Compose
docker-compose --verbose up
```

### Backup et restauration

```bash
# Backup automatique avec le script
./scripts/deploy.sh prod deploy

# Backup manuel
docker-compose exec mysql mysqldump -u root -p anosdb > backup.sql

# Restauration
docker-compose exec -T mysql mysql -u root -p anosdb < backup.sql
```

---

## Commandes de référence rapide

### Docker Compose
```bash
docker-compose up -d              # Démarrer
docker-compose down               # Arrêter
docker-compose logs -f            # Logs en temps réel
docker-compose ps                 # Status
docker-compose restart <service>  # Redémarrer un service
```

### Kubernetes
```bash
kubectl get pods -n pfe-app                      # Lister les pods
kubectl describe pod <pod-name> -n pfe-app       # Détails d'un pod
kubectl logs <pod-name> -n pfe-app -f            # Logs en temps réel
kubectl exec -it <pod-name> -n pfe-app -- bash   # Shell interactif
kubectl delete pod <pod-name> -n pfe-app         # Supprimer un pod
```

### Scripts utiles
```bash
./scripts/deploy.sh dev deploy        # Déploiement local
./scripts/deploy.sh prod rollback     # Rollback production
./scripts/k8s-deploy.sh deploy        # Déploiement K8s
./scripts/k8s-deploy.sh status        # Status K8s
./scripts/k8s-deploy.sh logs frontend # Logs frontend
```

---

## Support et contribution

Pour toute question ou problème :

1. Vérifier cette documentation
2. Consulter les logs
3. Vérifier les GitHub Issues
4. Contacter l'équipe DevOps

---

**Dernière mise à jour** : 2024
**Maintenu par** : Équipe PFE