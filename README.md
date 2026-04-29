# Pixel War – Kubernetes DevOps Project

## Description

Pixel War est une application web permettant aux utilisateurs de modifier un canvas en temps réel.  
Le projet a été entièrement conteneurisé et déployé sur un cluster Kubernetes local via Kind, avec une architecture DevOps complète incluant CI/CD, Helm, et GitHub Actions.

---

## Architecture globale

Le projet repose sur une architecture microservices :

- Frontend (React / Web UI)
- Backend (API Node.js / Express)
- Base de données (Redis)
- Kubernetes (Kind local cluster)
- Helm (gestion des déploiements)
- GitHub Actions (CI/CD)
- Self-hosted Runner (déploiement local automatique)

                        ┌────────────────────────────┐
                        │       GitHub Push          │
                        └────────────┬───────────────┘
                                     │
                                     ▼
                        ┌────────────────────────────┐
                        │   GitHub Actions (CI)      │
                        │ - Build Docker images      │
                        │ - Push Docker Hub          │
                        └────────────┬───────────────┘
                                     │
                                     ▼
                        ┌────────────────────────────┐
                        │ Self-hosted Runner (CD)    │
                        │ - Execute deploy locally   │
                        └────────────┬───────────────┘
                                     │
                                     ▼
                        ┌────────────────────────────┐
                        │     Helm Deployment        │
                        │ - Backend                  │
                        │ - Frontend                 │
                        │ - Redis                    │
                        └────────────┬───────────────┘
                                     │
                                     ▼
                        ┌────────────────────────────┐
                        │ Kubernetes (Kind Cluster)  │
                        │                            │
                        │  ┌──────────────┐          │
                        │  │ Frontend     │          │
                        │  └──────────────┘          │
                        │  ┌──────────────┐          │
                        │  │ Backend      │          │
                        │  └──────────────┘          │
                        │  ┌──────────────┐          │
                        │  │ Redis        │          │
                        │  └──────────────┘          │
                        │                            │
                        │ Ingress NGINX (8080)       │
                        └────────────────────────────┘
                                     │
                                     ▼
                        http://localhost:8080

---

## Architecture globale (flux CI/CD)

```text
GitHub Push
   ↓
GitHub Actions (CI)
   ↓
Docker Hub (images)
   ↓
Self-hosted Runner
   ↓
Helm Deploy
   ↓
Kubernetes (Kind cluster)
   ↓
Pixel War running (Frontend + Backend + Redis)
```

## Pipeline CI/CD

### CI (GitHub Actions – Cloud)

- Build des images Docker (backend + frontend)
- Push sur Docker Hub
- Tag basé sur commit SHA


### CD (Self-hosted Runner local)

- Déclenchement automatique après CI
- Vérification du cluster Kubernetes (Kind)
- Déploiement via Helm
- Mise à jour des pods automatiquement

## Self-hosted Runner

Un runner GitHub Actions est installé localement pour permettre le déploiement automatique sur le cluster Kind.

## Configuration du CD (Self-hosted Runner)

Le déploiement continu (CD) est réalisé via un runner GitHub Actions auto-hébergé sur la machine locale.

### Rôle du self-hosted runner

- Exécute les jobs de déploiement GitHub Actions en local
- Accède directement au cluster Kubernetes Kind
- Déploie l’application via Helm

---

## Technologies utilisées
- Kubernetes (Kind)
- Docker
- Helm
- GitHub Actions
- Node.js
- Redis
- Ingress NGINX

---

## Déploiement Kubernetes

### Création du cluster

```bash
kind create cluster --config ./k8s/kind-config.yaml
```

---

## Ingress Controller

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.11.2/deploy/static/provider/cloud/deploy.yaml
```

---

## Helm

Le déploiement de l’application est géré via Helm :

```bash
helm upgrade --install pixelwar ./helm -n pixelwar --create-namespace
```

Contenu du chart Helm :
- Deployment backend
- Deployment frontend
- Redis deployment
- ConfigMaps
- Secrets
- Services
- Ingress
- NetworkPolicies

---

## Configuration

ConfigMap backend
REDIS_HOST
REDIS_PORT
Secret Redis
password (encodé base64 via Kubernetes Secret)

---

## Docker

Les images sont construites et publiées sur Docker Hub :

pixelwar-backend
pixelwar-frontend

---

### Pré-requis

- Kubernetes Kind installé et opérationnel
- kubectl configuré sur la machine
- Helm installé
- Runner GitHub connecté au repository

---

### Déploiement automatique

Lors d’un push sur la branche `main` :

1. GitHub Actions construit et pousse les images Docker
2. Le self-hosted runner récupère le job CD
3. Le runner exécute :

```bash
kubectl get nodes
helm upgrade --install pixelwar ./helm -n pixelwar --create-namespace
```

---

### Accès au cluster local

Le cluster Kind est accessible via kubeconfig local :

```bash
kubectl config current-context
kubectl get pods -n pixelwar
```

---

### Ingress et exposition

Le trafic est exposé via Ingress NGINX :

Frontend accessible via http://localhost
Backend exposé via service interne Kubernetes 

---

## Lancer le projet localement

1. Créer le cluster

```bash
kind create cluster --config ./k8s/kind-config.yaml
```
  
2. Installer ingress

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.11.2/deploy/static/provider/cloud/deploy.yaml
```

3. Cloner le repo

```bash
git clone <repo-url>
cd pixel_war
```

4. Déploiement complet

Une seule commande permet de tout déployer :

```bash
helm upgrade --install pixelwar ./helm -n pixelwar --create-namespace
```

5. Accès à l'application (port forwarding)

Comme nous utilisons un cluster local Kind, l’accès au frontend passe par l’Ingress NGINX.

Pour exposer l’application sur la machine locale, nous utilisons un port-forward.

```bash
kubectl port-forward -n ingress-nginx svc/ingress-nginx-controller 8080:80
```

---

## Explication des ressources Kubernetes

### Deployment
Permet de gérer le cycle de vie des pods (frontend, backend, redis).  
Il assure le redémarrage automatique et la scalabilité.

---

### ConfigMap
Stocke les variables de configuration non sensibles :
- REDIS_HOST
- REDIS_PORT

---

### Secret
Stocke les données sensibles comme le mot de passe Redis.  
Les données sont encodées en base64 et injectées dans les pods. (Pas la meilleur méthode)

---

### Ingress
Expose l’application à l’extérieur du cluster via un point d’entrée unique (port 8080 en local).

---

### PersistentVolumeClaim (Redis)
Permet de stocker les données Redis de manière persistante même si le pod redémarre.

---

## Sécurité

Le projet applique une approche DevOps sécurisée :

- Secrets Kubernetes pour les mots de passe Redis
- Injection des secrets via GitHub Secrets (CI/CD)
- Aucune donnée sensible dans Git
- ConfigMaps pour les données non sensibles
- Séparation stricte configuration / secrets
- NetworkPolicies pour contrôler les flux réseau

---

## Difficultés rencontrées
- Gestion des secrets Kubernetes
- Configuration du self-hosted runner Windows
- Debug des erreurs CreateContainerConfigError
- Synchronisation CI/CD + cluster local
- Configuration Helm multi-environnements

---

## Améliorations possibles

- Ajout de monitoring avec Prometheus + Grafana
- Déploiement sur cloud (AWS / GCP / Azure)
- Séparation des environnements (dev / prod)
- Sécurisation avancée des secrets (Sealed Secrets / Vault)