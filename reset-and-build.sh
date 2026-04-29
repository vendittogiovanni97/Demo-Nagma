#!/bin/bash
# Docker Reset and Rebuild Script for Nagma Project
# This script will:
# 1. Stop and remove all containers
# 2. Remove old images
# 3. Remove volumes
# 4. Rebuild and start everything fresh

set -e

echo "🔄 Starting Docker reset and rebuild for Nagma..."
echo ""

cd /Users/giovannivenditto/Documents/Demo-Nagma

echo "📦 Step 1: Stopping containers and removing orphans..."
docker compose down --remove-orphans

echo ""
echo "🗑️  Step 2: Removing old images..."
docker rmi demo-nagma-backend demo-nagma-frontend 2>/dev/null || echo "   (Images not found, skipping)"

echo ""
echo "💾 Step 3: Removing old volumes..."
docker volume rm demo-nagma_nagma_data 2>/dev/null || echo "   (Volume not found, skipping)"

echo ""
echo "🏗️  Step 4: Building and starting all services..."
echo "   (This may take 2-3 minutes on first build)"
echo ""

docker compose up --build

echo ""
echo "✅ Build complete!"
echo ""
echo "Services should be running at:"
echo "  • Frontend:  http://localhost:3000"
echo "  • Backend:   http://localhost:3001"
echo "  • Database:  postgres://root:root123@localhost:5432/nagmadb_"
