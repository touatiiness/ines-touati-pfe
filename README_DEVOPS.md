# 🚀 DevOps Setup - PFE Application

## Vue d'ensemble rapide

Cette application est maintenant entièrement containerisée et prête pour le déploiement avec CI/CD.

```
┌─────────────────────────────────────────────┐
│  🎯 Quick Start - Démarrage en 3 commandes │
└─────────────────────────────────────────────┘

1️⃣  Copier les variables d'environnement
    cp .env.example .env
    # Éditer .env avec vos valeurs

2️⃣  Démarrer tous les services
    docker-compose up -d

3️⃣  Accéder à l'application
    http://localhost
```

---

## 📦 Ce qui a été ajouté

### Fichiers Docker

✅ **Dockerfiles optimisés** (multi-stage builds)
- `frontend/Dockerfile` - Angular + Nginx
- `backend/back-spring/Dockerfile` - Spring Boot + Maven
- `backend/back-python/Dockerfile` - FastAPI + ML libraries

✅ **Configuration Nginx**
- `frontend/nginx.conf` - Reverse proxy pour les 2 backends

✅ **Docker Compose**
- `docker-compose.yml` - Orchestration complète
- `docker-compose.monitoring.yml` - Stack Prometheus + Grafana

✅ **Fichiers .dockerignore** pour optimiser les builds

### CI/CD Pipelines

✅ **Jenkins**
- `Jenkinsfile` - Pipeline complet avec build, test, scan, deploy

✅ **GitHub Actions**
- `.github/workflows/ci-cd.yml` - Workflow automatisé

### Kubernetes

✅ **Manifests K8s complets**
```
k8s/
├── namespace.yaml                     # Namespace pfe-app
├── mysql-deployment.yaml              # StatefulSet MySQL
├── backend-spring-deployment.yaml     # Deployment + HPA
├── backend-python-deployment.yaml     # Deployment + HPA
├── frontend-deployment.yaml           # Deployment + HPA
└── ingress.yaml                       # Ingress + SSL
```

### Monitoring

✅ **Prometheus**
- `monitoring/prometheus/prometheus.yml` - Configuration Prometheus
- `monitoring/prometheus/alerts/` - Alertes configurées

✅ **Grafana**
- `monitoring/grafana/provisioning/` - Datasources pré-configurés

✅ **Alertmanager**
- `monitoring/alertmanager/alertmanager.yml` - Alertes email

### Scripts

✅ **Scripts de déploiement**
- `scripts/deploy.sh` - Déploiement Docker Compose
- `scripts/k8s-deploy.sh` - Déploiement Kubernetes

### Documentation

✅ **Documentation complète**
- `DEVOPS.md` - Guide DevOps complet
- `DEPLOYMENT_CHECKLIST.md` - Checklist de déploiement
- `README_DEVOPS.md` - Ce fichier

---

## 🎯 Démarrage rapide

### Option 1 : Docker Compose (Développement local)

```bash
# 1. Configuration
cp .env.example .env
# Éditer .env avec vos valeurs

# 2. Démarrer
docker-compose up -d

# 3. Vérifier
docker-compose ps
docker-compose logs -f

# 4. Accéder
# Frontend : http://localhost
# Spring : http://localhost:8080
# Python : http://localhost:8001
```

### Option 2 : Kubernetes (Production)

```bash
# 1. Éditer les secrets dans k8s/
vim k8s/mysql-deployment.yaml          # Mots de passe MySQL
vim k8s/backend-spring-deployment.yaml # JWT secret
vim k8s/backend-python-deployment.yaml # OpenAI API key
vim k8s/ingress.yaml                   # Domaine + email

# 2. Déployer
chmod +x scripts/k8s-deploy.sh
./scripts/k8s-deploy.sh deploy

# 3. Vérifier
kubectl get pods -n pfe-app
kubectl get svc -n pfe-app
kubectl get ingress -n pfe-app
```

---

## 🔧 Configuration requise

### Variables d'environnement (.env)

```env
# Database
DB_ROOT_PASSWORD=rootpassword123        # ⚠️ À changer en production
DB_USER=pfeuser
DB_PASSWORD=pfepassword123              # ⚠️ À changer en production

# Spring Boot
JWT_SECRET=VotreClefSecreteProductionUltraSecure987654321
JWT_EXPIRATION_MS=86400000

# Python Backend
OPENAI_API_KEY=sk-votre-clef-openai-ici # ⚠️ Obligatoire
```

### Ports utilisés

| Service | Port | Description |
|---------|------|-------------|
| Frontend (Nginx) | 80 | Interface web |
| Backend Spring | 8080 | API REST Spring Boot |
| Backend Python | 8001 | API FastAPI + IA |
| MySQL | 3306 | Base de données |
| Prometheus | 9090 | Métriques |
| Grafana | 3000 | Dashboards |
| Alertmanager | 9093 | Alertes |

---

## 📊 Monitoring

### Démarrer le monitoring

```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

### Accès aux interfaces

| Service | URL | Credentials |
|---------|-----|-------------|
| Prometheus | http://localhost:9090 | - |
| Grafana | http://localhost:3000 | admin / admin123 |
| Alertmanager | http://localhost:9093 | - |

### Dashboards Grafana recommandés

1. **Spring Boot 2.1 System Monitor** - ID: 11378
2. **Node Exporter Full** - ID: 1860
3. **Docker and System Monitoring** - ID: 893
4. **MySQL Overview** - ID: 7362

Importer via : Dashboards → Import → Enter ID

---

## 🔄 CI/CD

### Jenkins

**Prérequis :**
1. Jenkins installé avec plugins Docker Pipeline, Git
2. Credentials Docker Hub configurés : `dockerhub-credentials`

**Configuration :**
1. Éditer `Jenkinsfile` ligne 7 : remplacer `votre-username`
2. Créer un pipeline dans Jenkins
3. Pointer vers le repository Git
4. Lancer le build

**Stages du pipeline :**
- ✅ Checkout
- ✅ Build Images (parallel)
- ✅ Run Tests (parallel)
- ✅ Security Scan (Trivy)
- ✅ Push to Registry (branches main/develop)
- ✅ Deploy to Staging (branch develop)
- ✅ Deploy to Production (branch main, avec approbation manuelle)

### GitHub Actions

**Automatique sur push/PR vers main ou develop**

Le workflow exécute :
1. Build et test de chaque service
2. Construction des images Docker
3. Scan de sécurité Trivy
4. Push vers GitHub Container Registry
5. Déploiement automatique (staging/production)

Voir les runs dans l'onglet "Actions" de GitHub.

---

## 🛡️ Sécurité

### Bonnes pratiques implémentées

✅ Multi-stage Docker builds (images optimisées)
✅ Utilisateurs non-root dans tous les conteneurs
✅ Secrets dans variables d'environnement (pas hardcodés)
✅ Health checks sur tous les services
✅ Security scanning avec Trivy
✅ SSL/TLS dans Kubernetes (cert-manager)
✅ Resource limits et quotas
✅ CORS configuré
✅ Security headers dans Nginx

### Scan de sécurité

```bash
# Scan des images Docker
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image pfe-frontend:latest

docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image pfe-backend-spring:latest

docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image pfe-backend-python:latest
```

---

## 🧪 Tests

### Credentials de test

**Étudiant :**
- ID : `422001`
- Mot de passe : `123456`

**Professeur :**
- ID : `PROF001`
- Mot de passe : `123456`

### Tests de santé

```bash
# Frontend
curl http://localhost/

# Spring Boot
curl http://localhost:8080/actuator/health

# Python Backend
curl http://localhost:8001/
```

---

## 📚 Documentation

### Fichiers de documentation

| Fichier | Description |
|---------|-------------|
| `DEVOPS.md` | Guide DevOps complet (architecture, installation, troubleshooting) |
| `DEPLOYMENT_CHECKLIST.md` | Checklist étape par étape pour chaque déploiement |
| `README_DEVOPS.md` | Ce fichier - Vue d'ensemble rapide |

### Commandes utiles

**Docker Compose :**
```bash
docker-compose up -d              # Démarrer
docker-compose down               # Arrêter
docker-compose logs -f            # Logs temps réel
docker-compose ps                 # Status
docker-compose restart <service>  # Redémarrer un service
docker-compose exec <service> bash # Shell interactif
```

**Kubernetes :**
```bash
kubectl get pods -n pfe-app                    # Lister pods
kubectl logs <pod> -n pfe-app -f               # Logs temps réel
kubectl exec -it <pod> -n pfe-app -- bash      # Shell interactif
kubectl describe pod <pod> -n pfe-app          # Détails pod
kubectl delete pod <pod> -n pfe-app            # Supprimer pod
```

**Scripts :**
```bash
./scripts/deploy.sh dev deploy                 # Déploiement dev
./scripts/deploy.sh prod rollback              # Rollback prod
./scripts/k8s-deploy.sh deploy                 # Déploiement K8s
./scripts/k8s-deploy.sh status                 # Status K8s
./scripts/k8s-deploy.sh logs <service>         # Logs K8s
./scripts/k8s-deploy.sh rollback <service>     # Rollback K8s
```

---

## 🐛 Troubleshooting

### Service ne démarre pas

```bash
# Voir les logs
docker-compose logs -f <service>

# Redémarrer un service
docker-compose restart <service>

# Reconstruire
docker-compose build --no-cache <service>
docker-compose up -d <service>
```

### Base de données inaccessible

```bash
# Vérifier MySQL
docker-compose ps mysql

# Tester connexion
docker-compose exec mysql mysql -u root -p

# Voir les logs MySQL
docker-compose logs -f mysql
```

### Erreur de mémoire

```bash
# Vérifier l'utilisation
docker stats

# Augmenter les limites dans docker-compose.yml
# Puis :
docker-compose down
docker-compose up -d
```

### Nettoyer Docker

```bash
# Supprimer conteneurs arrêtés
docker container prune -f

# Supprimer images non utilisées
docker image prune -a -f

# Supprimer volumes non utilisés
docker volume prune -f

# Tout nettoyer
docker system prune -a --volumes -f
```

---

## 📈 Évolutions futures

### Prochaines étapes recommandées

- [ ] ELK Stack pour logging centralisé
- [ ] Distributed tracing avec Jaeger
- [ ] Service mesh avec Istio
- [ ] GitOps avec ArgoCD
- [ ] Backup automatique de la base de données
- [ ] Tests de charge avec JMeter/K6
- [ ] Feature flags avec LaunchDarkly

---

## 🤝 Support

### En cas de problème

1. ✅ Vérifier cette documentation
2. ✅ Consulter `DEVOPS.md` pour plus de détails
3. ✅ Vérifier les logs avec `docker-compose logs -f`
4. ✅ Consulter le troubleshooting dans `DEVOPS.md`

### Contacts

- DevOps Lead : ___________________
- Backend Dev : ___________________
- Frontend Dev : ___________________

---

## 📝 Changelog DevOps

### Version 1.0.0 (2024)

✅ Dockerisation complète de l'application
✅ CI/CD avec Jenkins et GitHub Actions
✅ Manifests Kubernetes avec HPA et Ingress
✅ Monitoring avec Prometheus + Grafana
✅ Scripts de déploiement automatisés
✅ Documentation complète
✅ Security scanning avec Trivy
✅ Health checks sur tous les services

---

**Dernière mise à jour** : Décembre 2024
**Maintenu par** : Équipe DevOps PFE

---

## ⭐ Quick Reference

```bash
# Démarrage rapide
cp .env.example .env && docker-compose up -d

# Monitoring
docker-compose -f docker-compose.monitoring.yml up -d

# Logs
docker-compose logs -f

# Status
docker-compose ps

# Arrêt
docker-compose down

# Nettoyage complet
docker-compose down -v --rmi all
```

**🎉 Votre application est maintenant prête pour la production !**