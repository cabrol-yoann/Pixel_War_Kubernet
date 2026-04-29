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

---

## Pipeline CI/CD

### CI (GitHub Actions – Cloud)

À chaque push sur `main` :

1. Checkout du code
2. Build des images Docker :
   - backend
   - frontend
3. Push sur Docker Hub

---

### CD (Self-hosted Runner local)

Sur la machine locale :

1. Détection du runner GitHub Actions
2. Déploiement sur cluster Kind
3. Installation / mise à jour de l’application via Helm

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

## Sécurité

Le projet implémente plusieurs mécanismes de sécurité :

Secrets Kubernetes pour les mots de passe Redis
ConfigMaps pour la configuration non sensible
Aucune donnée sensible stockée dans Git
NetworkPolicies pour contrôler les communications internes

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

## Self-hosted Runner

Un runner GitHub Actions est installé localement pour permettre le déploiement automatique sur le cluster Kind.

---

Lancer le projet localement

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

## Difficultés rencontrées
- Gestion des secrets Kubernetes
- Configuration du self-hosted runner Windows
- Debug des erreurs CreateContainerConfigError
- Synchronisation CI/CD + cluster local
- Configuration Helm multi-environnements
