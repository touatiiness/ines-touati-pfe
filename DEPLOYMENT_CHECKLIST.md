# 📋 Checklist de déploiement - PFE Application

## ✅ Pré-déploiement

### Configuration de l'environnement

- [ ] Variables d'environnement configurées dans `.env`
  - [ ] `DB_ROOT_PASSWORD` - Mot de passe MySQL fort
  - [ ] `DB_USER` et `DB_PASSWORD` - Credentials de la base de données
  - [ ] `JWT_SECRET` - Clé secrète JWT (min 32 caractères)
  - [ ] `OPENAI_API_KEY` - Clé API OpenAI valide

- [ ] Fichiers de configuration vérifiés
  - [ ] `backend/back-spring/src/main/resources/application-prod.properties`
  - [ ] `docker-compose.yml`
  - [ ] `Jenkinsfile`
  - [ ] `.github/workflows/ci-cd.yml`

### Infrastructure

- [ ] Docker et Docker Compose installés
  - [ ] Docker version 20.10+
  - [ ] Docker Compose version 2.0+

- [ ] Ressources système suffisantes
  - [ ] RAM : 4GB minimum, 8GB recommandé
  - [ ] CPU : 2 cores minimum, 4 cores recommandé
  - [ ] Stockage : 20GB minimum d'espace disque

- [ ] Réseau configuré
  - [ ] Ports disponibles : 80, 8080, 8001, 3306
  - [ ] Pare-feu configuré si nécessaire
  - [ ] DNS configuré (si déploiement production)

### Code et dépendances

- [ ] Code source à jour
  - [ ] Dernière version du code sur la branche appropriée
  - [ ] Tous les tests passent localement
  - [ ] Pas de credentials hardcodés dans le code

- [ ] Dépendances vérifiées
  - [ ] `frontend/package.json` - Angular 15
  - [ ] `backend/back-spring/pom.xml` - Spring Boot 2.7.18
  - [ ] `backend/back-python/requirements.txt` - Python 3.11

---

## 🔧 Déploiement local (Docker Compose)

### Étape 1 : Préparation

- [ ] Cloner le repository
  ```bash
  git clone <repo-url>
  cd pfe-app
  ```

- [ ] Copier et configurer `.env`
  ```bash
  cp .env.example .env
  # Éditer .env avec les vraies valeurs
  ```

- [ ] Vérifier la structure des fichiers
  ```bash
  ls -la
  # Vérifier : Dockerfiles, docker-compose.yml, .env
  ```

### Étape 2 : Build

- [ ] Construire les images Docker
  ```bash
  docker-compose build --parallel
  ```

- [ ] Vérifier les images créées
  ```bash
  docker images | grep pfe
  ```

### Étape 3 : Démarrage

- [ ] Démarrer MySQL en premier
  ```bash
  docker-compose up -d mysql
  sleep 30  # Attendre que MySQL soit prêt
  ```

- [ ] Démarrer tous les services
  ```bash
  docker-compose up -d
  ```

- [ ] Vérifier que tous les services sont "healthy"
  ```bash
  docker-compose ps
  # Tous doivent avoir status "Up" et "healthy"
  ```

### Étape 4 : Vérification

- [ ] Tester l'accès au frontend
  - [ ] http://localhost accessible
  - [ ] Page de connexion s'affiche correctement

- [ ] Tester les backends
  - [ ] http://localhost:8080/actuator/health retourne "UP"
  - [ ] http://localhost:8001 retourne une réponse

- [ ] Tester l'authentification
  - [ ] Login étudiant : 422001 / 123456
  - [ ] Login professeur : PROF001 / 123456

- [ ] Vérifier les logs
  ```bash
  docker-compose logs -f
  # Pas d'erreurs critiques
  ```

---

## 🚀 Déploiement CI/CD

### Jenkins

- [ ] **Configuration Jenkins**
  - [ ] Jenkins installé et accessible
  - [ ] Plugins installés : Docker Pipeline, Git, Credentials Binding
  - [ ] Credentials configurés : `dockerhub-credentials`

- [ ] **Configuration du pipeline**
  - [ ] Nouveau pipeline créé
  - [ ] SCM configuré avec le repository Git
  - [ ] Jenkinsfile détecté

- [ ] **Variables à configurer dans Jenkinsfile**
  - [ ] `IMAGE_PREFIX` - Remplacer `votre-username` par votre username Docker Hub
  - [ ] `DOCKER_CREDENTIALS_ID` - Vérifier le nom des credentials

- [ ] **Premier build**
  - [ ] Lancer le build manuellement
  - [ ] Vérifier que toutes les étapes passent
  - [ ] Vérifier les images sur Docker Hub

### GitHub Actions

- [ ] **Secrets GitHub configurés**
  - [ ] `GITHUB_TOKEN` (automatique)
  - [ ] Optionnel : `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`

- [ ] **Workflow vérifié**
  - [ ] Fichier `.github/workflows/ci-cd.yml` présent
  - [ ] Push sur develop/main déclenche le workflow

- [ ] **Vérification**
  - [ ] Onglet "Actions" dans GitHub
  - [ ] Tous les jobs passent au vert ✅
  - [ ] Images publiées sur GitHub Container Registry

---

## ☸️ Déploiement Kubernetes

### Prérequis

- [ ] Cluster Kubernetes disponible
  - [ ] kubectl configuré et connecté au cluster
  - [ ] Version Kubernetes 1.24+

- [ ] Addons installés
  - [ ] Nginx Ingress Controller
  - [ ] cert-manager (pour SSL)
  - [ ] Metrics Server (pour HPA)

### Secrets et ConfigMaps

- [ ] **Configurer les secrets sensibles dans k8s/**
  - [ ] `k8s/mysql-deployment.yaml` : mots de passe MySQL
  - [ ] `k8s/backend-spring-deployment.yaml` : JWT secret
  - [ ] `k8s/backend-python-deployment.yaml` : OpenAI API key
  - [ ] `k8s/ingress.yaml` : email pour Let's Encrypt

- [ ] **Remplacer les placeholders**
  - [ ] `votre-username` → votre username GitHub/Docker
  - [ ] `votre-domaine.com` → votre nom de domaine réel
  - [ ] `votre-email@example.com` → votre email

### Déploiement

- [ ] **Namespace**
  ```bash
  kubectl apply -f k8s/namespace.yaml
  kubectl get namespace pfe-app
  ```

- [ ] **MySQL**
  ```bash
  kubectl apply -f k8s/mysql-deployment.yaml
  kubectl wait --for=condition=ready pod -l app=mysql -n pfe-app --timeout=300s
  ```

- [ ] **Backends**
  ```bash
  kubectl apply -f k8s/backend-spring-deployment.yaml
  kubectl apply -f k8s/backend-python-deployment.yaml
  kubectl wait --for=condition=available deployment/backend-spring -n pfe-app --timeout=300s
  kubectl wait --for=condition=available deployment/backend-python -n pfe-app --timeout=300s
  ```

- [ ] **Frontend**
  ```bash
  kubectl apply -f k8s/frontend-deployment.yaml
  kubectl wait --for=condition=available deployment/frontend -n pfe-app --timeout=300s
  ```

- [ ] **Ingress**
  ```bash
  kubectl apply -f k8s/ingress.yaml
  kubectl get ingress -n pfe-app
  ```

### Vérification

- [ ] **Pods en cours d'exécution**
  ```bash
  kubectl get pods -n pfe-app
  # Tous doivent être "Running" et "Ready"
  ```

- [ ] **Services exposés**
  ```bash
  kubectl get svc -n pfe-app
  ```

- [ ] **Ingress configuré**
  ```bash
  kubectl describe ingress pfe-ingress -n pfe-app
  # Vérifier que l'IP est assignée
  ```

- [ ] **Certificat SSL**
  ```bash
  kubectl get certificate -n pfe-app
  # Status doit être "Ready"
  ```

- [ ] **HPA actif**
  ```bash
  kubectl get hpa -n pfe-app
  # Vérifier les réplicas min/max
  ```

---

## 📊 Monitoring

### Prometheus + Grafana

- [ ] **Démarrer le stack de monitoring**
  ```bash
  docker-compose -f docker-compose.monitoring.yml up -d
  ```

- [ ] **Vérifier l'accès**
  - [ ] Prometheus : http://localhost:9090
  - [ ] Grafana : http://localhost:3000
  - [ ] Alertmanager : http://localhost:9093

- [ ] **Configurer Grafana**
  - [ ] Login : admin / admin123
  - [ ] Importer les dashboards recommandés
  - [ ] Vérifier que les métriques arrivent

- [ ] **Configurer Alertmanager**
  - [ ] Éditer `monitoring/alertmanager/alertmanager.yml`
  - [ ] Configurer SMTP pour les emails
  - [ ] Tester l'envoi d'alertes

### Vérification des métriques

- [ ] **Spring Boot Actuator**
  - [ ] http://localhost:8080/actuator/health
  - [ ] http://localhost:8080/actuator/metrics
  - [ ] http://localhost:8080/actuator/prometheus

- [ ] **Prometheus targets**
  - [ ] http://localhost:9090/targets
  - [ ] Tous les targets doivent être "UP"

---

## 🔒 Sécurité

### Scan de sécurité

- [ ] **Trivy scan des images**
  ```bash
  docker run --rm aquasec/trivy image pfe-frontend:latest
  docker run --rm aquasec/trivy image pfe-backend-spring:latest
  docker run --rm aquasec/trivy image pfe-backend-python:latest
  ```

- [ ] **Vérifier les vulnérabilités**
  - [ ] Aucune vulnérabilité CRITICAL non corrigée
  - [ ] Documenter les HIGH et créer des tickets

### Bonnes pratiques

- [ ] **Secrets**
  - [ ] Aucun secret hardcodé dans le code
  - [ ] Tous les secrets dans .env ou Kubernetes Secrets
  - [ ] .env dans .gitignore

- [ ] **SSL/TLS**
  - [ ] Certificat SSL configuré
  - [ ] HTTPS forcé dans Ingress
  - [ ] Certificat valide et non expiré

- [ ] **Permissions**
  - [ ] Conteneurs s'exécutent en non-root
  - [ ] Volumes montés en read-only quand possible
  - [ ] Network policies configurées (si disponible)

---

## 🧪 Tests post-déploiement

### Tests fonctionnels

- [ ] **Page d'accueil**
  - [ ] Frontend charge correctement
  - [ ] Pas d'erreurs dans la console navigateur

- [ ] **Authentification**
  - [ ] Login étudiant fonctionne
  - [ ] Login professeur fonctionne
  - [ ] Logout fonctionne

- [ ] **Fonctionnalités principales**
  - [ ] Accès aux cours
  - [ ] Système de quiz
  - [ ] Recommandations AI
  - [ ] Dashboard étudiant/professeur

### Tests de performance

- [ ] **Temps de réponse**
  - [ ] Page d'accueil < 2s
  - [ ] API Spring < 500ms
  - [ ] API Python < 1s

- [ ] **Charge**
  - [ ] Test avec 10 utilisateurs simultanés
  - [ ] Pas de crash ou erreur 500
  - [ ] Métriques CPU/Memory stables

### Tests d'intégration

- [ ] **Base de données**
  - [ ] Connexion Spring Boot ↔ MySQL
  - [ ] Migrations appliquées
  - [ ] Données de test présentes

- [ ] **Communication inter-services**
  - [ ] Frontend → Spring Backend
  - [ ] Frontend → Python Backend
  - [ ] Python → Spring (si applicable)

---

## 📝 Documentation

### Mise à jour de la documentation

- [ ] **README.md**
  - [ ] URLs de production mises à jour
  - [ ] Credentials de test documentés
  - [ ] Instructions de déploiement à jour

- [ ] **DEVOPS.md**
  - [ ] Architecture à jour
  - [ ] Procédures de déploiement documentées
  - [ ] Troubleshooting à jour

- [ ] **DEPLOYMENT_CHECKLIST.md**
  - [ ] Cette checklist complétée et datée

### Runbook

- [ ] **Procédures d'urgence documentées**
  - [ ] Comment faire un rollback
  - [ ] Contacts d'urgence
  - [ ] Logs à vérifier en cas de problème

---

## ✅ Validation finale

### Checklist de validation

- [ ] Tous les services sont UP et HEALTHY
- [ ] Monitoring actif et alertes configurées
- [ ] Backups automatiques configurés
- [ ] SSL/TLS actif
- [ ] Tests fonctionnels passent
- [ ] Documentation à jour
- [ ] Équipe formée sur les procédures
- [ ] Plan de rollback testé

### Sign-off

- [ ] **Dev Lead** : _____________________ Date: _______
- [ ] **DevOps** : _____________________ Date: _______
- [ ] **Product Owner** : _____________________ Date: _______

---

## 🆘 En cas de problème

### Rollback rapide

**Docker Compose :**
```bash
./scripts/deploy.sh prod rollback
```

**Kubernetes :**
```bash
./scripts/k8s-deploy.sh rollback <service-name>
```

### Contacts d'urgence

- DevOps Lead : ___________________
- Backend Dev : ___________________
- Frontend Dev : ___________________
- DBA : ___________________

### Logs à vérifier

1. `docker-compose logs -f` ou `kubectl logs -n pfe-app`
2. Prometheus Alerts : http://localhost:9093
3. Application logs dans Grafana

---

**Date de déploiement** : __________
**Version déployée** : __________
**Environnement** : ☐ Dev  ☐ Staging  ☐ Production
**Déployé par** : __________