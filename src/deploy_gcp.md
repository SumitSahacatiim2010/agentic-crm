# Google Cloud Deployment Guide

## Prerequisites
- Google Cloud SDK (`gcloud`) installed.
- Docker installed.
- A GCP Project ID (e.g., `banking-crm-prod`).

## 1. Setup

### Enable Services
```bash
gcloud services enable run.googleapis.com \
    artifactregistry.googleapis.com \
    cloudbuild.googleapis.com
```

### Authenticate
```bash
gcloud auth login
gcloud auth configure-docker
```

## 2. Containerization

### Build Docker Image
```bash
docker build -t gcr.io/YOUR_PROJECT_ID/banking-crm:v1 .
```

### Push to Container Registry
```bash
docker push gcr.io/YOUR_PROJECT_ID/banking-crm:v1
```

## 3. Deployment (Cloud Run)

### Deploy Command
```bash
gcloud run deploy banking-crm \
    --image gcr.io/YOUR_PROJECT_ID/banking-crm:v1 \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --memory 1024Mi
```

## 4. Environment Variables
To set runtime secrets (e.g. Database URL, API Keys), verify no hardcoded secrets exist in code and pass them during deploy:

```bash
gcloud run deploy banking-crm \
    --update-env-vars DATABASE_URL="postgresql://user:pass@host/db"
```

## 5. Automation
Use the provided `deploy.sh` script to automate Steps 2 & 3.
