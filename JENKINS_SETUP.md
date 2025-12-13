# 🔧 Guide d'installation et configuration Jenkins

## Table des matières
1. [Installation de Docker Desktop (Prérequis)](#installation-docker)
2. [Installation de Jenkins](#installation-jenkins)
3. [Configuration initiale](#configuration-initiale)
4. [Configuration du pipeline](#configuration-pipeline)
5. [Lancement du build](#lancement-build)

---

## 📦 Installation de Docker Desktop (Prérequis)

### Étape 1 : Télécharger Docker Desktop

1. Aller sur : https://www.docker.com/products/docker-desktop/
2. Télécharger **Docker Desktop for Windows**
3. Exécuter l'installateur

### Étape 2 : Installation

1. Lancer l'installateur `Docker Desktop Installer.exe`
2. Suivre les instructions
3. **Important** : Cocher "Use WSL 2 instead of Hyper-V" si proposé
4. Redémarrer l'ordinateur si demandé

### Étape 3 : Vérification

```powershell
# Ouvrir PowerShell et exécuter :
docker --version
docker-compose --version
```

Vous devriez voir :
```
Docker version 24.x.x
Docker Compose version v2.x.x
```

---

## 🚀 Installation de Jenkins

### Option 1 : Jenkins avec Docker (Recommandé)

C'est la méthode la plus simple et rapide :

#### 1. Créer un volume Docker pour Jenkins

```powershell
docker volume create jenkins-data
```

#### 2. Lancer Jenkins avec Docker

```powershell
docker run -d `
  --name jenkins `
  -p 8080:8080 `
  -p 50000:50000 `
  -v jenkins-data:/var/jenkins_home `
  -v //var/run/docker.sock:/var/run/docker.sock `
  jenkins/jenkins:lts
```

**Sur PowerShell**, utilisez les backticks `` ` `` pour continuer sur plusieurs lignes.

#### 3. Récupérer le mot de passe initial

```powershell
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

Copiez ce mot de passe, vous en aurez besoin.

#### 4. Accéder à Jenkins

Ouvrir le navigateur : **http://localhost:8080**

---

### Option 2 : Installation native Windows

Si vous préférez installer Jenkins directement sur Windows :

#### 1. Installer Java JDK 17

1. Télécharger : https://adoptium.net/temurin/releases/?version=17
2. Choisir "Windows x64 Installer (.msi)"
3. Installer avec les options par défaut
4. Vérifier l'installation :

```powershell
java -version
```

#### 2. Télécharger Jenkins

1. Aller sur : https://www.jenkins.io/download/
2. Télécharger **Windows Installer (.msi)**
3. Exécuter l'installateur

#### 3. Installation

1. Suivre les instructions de l'installateur
2. Port par défaut : 8080
3. Choisir "Run service as LocalSystem"
4. Terminer l'installation

#### 4. Accéder à Jenkins

1. Jenkins devrait démarrer automatiquement
2. Ouvrir : **http://localhost:8080**
3. Le mot de passe se trouve dans : `C:\ProgramData\Jenkins\.jenkins\secrets\initialAdminPassword`

---

## ⚙️ Configuration initiale de Jenkins

### Étape 1 : Déverrouillage

1. Accéder à http://localhost:8080
2. Entrer le mot de passe initial (récupéré précédemment)
3. Cliquer sur "Continue"

### Étape 2 : Installation des plugins

1. Choisir **"Install suggested plugins"**
2. Attendre que tous les plugins s'installent (~5-10 minutes)

### Étape 3 : Créer le compte admin

1. Remplir les informations :
   - Username : `admin`
   - Password : `admin123` (ou votre choix)
   - Full name : Votre nom
   - Email : votre email
2. Cliquer sur "Save and Continue"

### Étape 4 : Configuration de l'URL

1. Vérifier que l'URL est `http://localhost:8080/`
2. Cliquer sur "Save and Finish"
3. Cliquer sur "Start using Jenkins"

---

## 🔌 Installation des plugins nécessaires

### Plugins requis pour notre pipeline :

1. **Docker Pipeline**
2. **Git plugin** (normalement déjà installé)
3. **Pipeline** (normalement déjà installé)
4. **Credentials Binding**

### Installation :

1. Aller dans **Manage Jenkins** → **Manage Plugins**
2. Aller dans l'onglet **Available plugins**
3. Rechercher et installer :
   - `Docker Pipeline`
   - `Credentials Binding` (si pas déjà installé)
4. Cocher "Restart Jenkins when installation is complete"

---

## 🔑 Configuration des Credentials

### 1. Créer un compte Docker Hub (si vous n'en avez pas)

1. Aller sur : https://hub.docker.com/signup
2. Créer un compte gratuit
3. Se connecter

### 2. Créer un Access Token Docker Hub

1. Aller dans **Account Settings** → **Security**
2. Cliquer sur **New Access Token**
3. Nom du token : `jenkins-pipeline`
4. Permissions : **Read, Write, Delete**
5. Cliquer sur **Generate**
6. **⚠️ COPIER LE TOKEN** (vous ne pourrez plus le voir après)

### 3. Ajouter les credentials dans Jenkins

1. Dans Jenkins, aller dans **Manage Jenkins** → **Manage Credentials**
2. Cliquer sur **(global)** sous "Stores scoped to Jenkins"
3. Cliquer sur **Add Credentials**

#### Configuration :

- **Kind** : Username with password
- **Scope** : Global
- **Username** : Votre username Docker Hub
- **Password** : Le token généré (pas votre mot de passe !)
- **ID** : `dockerhub-credentials`
- **Description** : Docker Hub Credentials

4. Cliquer sur **Create**

---

## 📝 Modification du Jenkinsfile

Avant de créer le pipeline, mettons à jour le Jenkinsfile avec votre username Docker Hub :

1. Ouvrir le fichier `Jenkinsfile` dans votre projet
2. Trouver la ligne 7 :
```groovy
IMAGE_PREFIX = 'votre-username'
```

3. Remplacer `votre-username` par votre username Docker Hub
4. Sauvegarder

5. Commit et push :
```bash
cd "C:\Users\MO EHAB\Desktop\pfe v2 - Copie"
git add Jenkinsfile
git commit -m "Update Jenkinsfile with Docker Hub username"
git push
```

---

## 🔨 Création du Pipeline Jenkins

### Étape 1 : Créer un nouveau Pipeline

1. Sur la page d'accueil Jenkins, cliquer sur **New Item**
2. Nom : `pfe-cicd-pipeline`
3. Type : **Pipeline**
4. Cliquer sur **OK**

### Étape 2 : Configuration du Pipeline

#### Section "General" :

- Cocher **GitHub project**
- Project url : `https://github.com/muhammedehab35/iness/`

#### Section "Build Triggers" (optionnel) :

- Cocher **Poll SCM**
- Schedule : `H/5 * * * *` (vérifie toutes les 5 minutes)

Ou :
- Cocher **GitHub hook trigger for GITScm polling** (si vous configurez un webhook)

#### Section "Pipeline" :

- **Definition** : Pipeline script from SCM
- **SCM** : Git
- **Repository URL** : `https://github.com/muhammedehab35/iness.git`
- **Credentials** : None (repository public)
- **Branch Specifier** : `*/master`
- **Script Path** : `Jenkinsfile`

### Étape 3 : Sauvegarder

Cliquer sur **Save**

---

## 🚀 Lancement du premier build

### Méthode 1 : Build manuel

1. Sur la page du pipeline `pfe-cicd-pipeline`
2. Cliquer sur **Build Now** dans le menu de gauche
3. Le build apparaît dans **Build History**
4. Cliquer sur le numéro du build (ex: #1)
5. Cliquer sur **Console Output** pour voir les logs

### Méthode 2 : Lancement automatique

Si vous avez configuré "Poll SCM" ou "GitHub webhook", le build se lancera automatiquement à chaque push.

---

## 📊 Suivi du Pipeline

### Vue du Pipeline

1. Sur la page du build, vous verrez les **stages** :
   - ✅ Checkout
   - ✅ Build Images (parallel)
   - ✅ Run Tests (parallel)
   - ✅ Security Scan
   - ✅ Push to Registry
   - ⏸️ Deploy to Staging (si branche develop)
   - ⏸️ Deploy to Production (si branche main, avec approbation)

### Console Output

Cliquer sur **Console Output** pour voir :
```
Started by user admin
Obtained Jenkinsfile from git https://github.com/muhammedehab35/iness.git
[Pipeline] Start of Pipeline
[Pipeline] node
Running on Jenkins in /var/jenkins_home/workspace/pfe-cicd-pipeline
[Pipeline] {
[Pipeline] stage
[Pipeline] { (Checkout)
...
```

### Visualisation graphique

Le pipeline stage view vous montrera visuellement :
```
┌─────────────┐   ┌──────────────┐   ┌─────────────┐
│  Checkout   │ → │ Build Images │ → │  Run Tests  │
│    ✅       │   │  ✅ Frontend │   │  ✅         │
└─────────────┘   │  ✅ Spring   │   └─────────────┘
                  │  ✅ Python   │
                  └──────────────┘
```

---

## 🐛 Troubleshooting

### Problème : Docker not found dans Jenkins

**Solution** : Installer Docker dans le container Jenkins

```powershell
# Entrer dans le container Jenkins
docker exec -u root -it jenkins bash

# Installer Docker CLI
apt-get update
apt-get install -y docker.io

# Sortir
exit
```

Ou utiliser l'image Jenkins avec Docker intégré :
```powershell
docker stop jenkins
docker rm jenkins

docker run -d `
  --name jenkins `
  -p 8080:8080 `
  -p 50000:50000 `
  -v jenkins-data:/var/jenkins_home `
  -v //var/run/docker.sock:/var/run/docker.sock `
  jenkins/jenkins:lts-jdk17
```

### Problème : Permission denied sur Docker socket

```powershell
docker exec -u root jenkins chmod 666 /var/run/docker.sock
```

### Problème : Build échoue sur "docker build"

**Vérifier** :
1. Docker Desktop est lancé
2. Le socket Docker est monté : `-v //var/run/docker.sock:/var/run/docker.sock`
3. Les credentials Docker Hub sont corrects

### Problème : "ERROR: script not yet approved for use"

1. Aller dans **Manage Jenkins** → **In-process Script Approval**
2. Approuver les scripts en attente

### Problème : Tests échouent

C'est normal au début ! Les tests sont commentés dans le Jenkinsfile :
```groovy
// npm test -- --watch=false --browsers=ChromeHeadless
```

Pour activer les tests, décommenter ces lignes.

---

## 📈 Monitoring du Pipeline

### Tableau de bord

1. **Blue Ocean** (recommandé pour une meilleure visualisation) :
   - Installer le plugin "Blue Ocean"
   - Accéder via le menu "Open Blue Ocean"

2. **Build Trends** :
   - Sur la page du pipeline, voir l'historique des builds
   - Graphiques de durée et taux de succès

### Notifications (optionnel)

Configurer des notifications email en cas d'échec :

1. **Manage Jenkins** → **Configure System**
2. Section **E-mail Notification**
3. Configurer SMTP server

---

## 🎯 Workflow complet

### Pour développer une nouvelle feature :

```bash
# 1. Créer une branche
git checkout -b feature/nouvelle-fonctionnalite

# 2. Faire vos modifications
# ... éditer les fichiers ...

# 3. Commit et push
git add .
git commit -m "Add nouvelle fonctionnalite"
git push origin feature/nouvelle-fonctionnalite

# 4. Le pipeline Jenkins se lance automatiquement
# 5. Créer une Pull Request sur GitHub
# 6. Merger dans develop → Deploy automatique sur staging
# 7. Merger dans main → Deploy sur production (avec approbation)
```

### Approbation manuelle pour production :

Quand le pipeline atteint le stage "Deploy to Production" :
1. Jenkins vous demandera : "Deploy to production?"
2. Cliquer sur le build en cours
3. Cliquer sur "Proceed" ou "Abort"

---

## 📚 Commandes utiles

### Jenkins avec Docker

```powershell
# Voir les logs Jenkins
docker logs -f jenkins

# Redémarrer Jenkins
docker restart jenkins

# Arrêter Jenkins
docker stop jenkins

# Démarrer Jenkins
docker start jenkins

# Accéder au shell Jenkins
docker exec -it jenkins bash

# Backup des données Jenkins
docker run --rm -v jenkins-data:/data -v ${PWD}:/backup busybox tar czf /backup/jenkins-backup.tar.gz /data
```

### Jenkins natif Windows

```powershell
# Arrêter le service
net stop jenkins

# Démarrer le service
net start jenkins

# Redémarrer le service
net stop jenkins && net start jenkins
```

---

## ✅ Checklist de vérification

Avant de lancer le premier build :

- [ ] Docker Desktop est installé et lancé
- [ ] Jenkins est installé et accessible sur http://localhost:8080
- [ ] Plugin "Docker Pipeline" est installé
- [ ] Credentials Docker Hub sont configurés avec l'ID `dockerhub-credentials`
- [ ] Jenkinsfile a été modifié avec votre username Docker Hub
- [ ] Pipeline `pfe-cicd-pipeline` est créé et configuré
- [ ] Repository GitHub est accessible

---

## 🎉 Premier build réussi !

Quand tout fonctionne, vous devriez voir :

```
[Pipeline] stage
[Pipeline] { (Push to Registry)
[Pipeline] sh
+ docker push muhammedehab35/pfe-frontend:latest
The push refers to repository [docker.io/muhammedehab35/pfe-frontend]
...
latest: digest: sha256:xxx size: 1234
[Pipeline] }
[Pipeline] // stage
[Pipeline] End of Pipeline
Finished: SUCCESS
```

Vos images Docker seront visibles sur :
**https://hub.docker.com/u/muhammedehab35**

---

## 📞 Support

En cas de problème :
1. Vérifier les logs : **Console Output** dans Jenkins
2. Consulter la section **Troubleshooting** ci-dessus
3. Vérifier que tous les prérequis sont installés

---

**Dernière mise à jour** : Décembre 2024
**Auteur** : DevOps Team PFE
