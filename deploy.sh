#!/bin/bash

# Configuration
PROJECT_ID="banking-crm-demo-123" # REPLACE WITH YOUR ID
APP_NAME="banking-crm"
REGION="us-central1"
TAG="latest"

echo "🚀 Starting Deployment Pipeline..."

# 1. Build
echo "📦 Building Docker Image..."
docker build -t gcr.io/$PROJECT_ID/$APP_NAME:$TAG .

# 2. Push
echo "⬆️ Pushing to Google Container Registry..."
docker push gcr.io/$PROJECT_ID/$APP_NAME:$TAG

# 3. Deploy
echo "☁️ Deploying to Cloud Run..."
gcloud run deploy $APP_NAME \
    --image gcr.io/$PROJECT_ID/$APP_NAME:$TAG \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated

echo "✅ Deployment Complete!"
