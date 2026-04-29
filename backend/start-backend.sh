#!/bin/bash

# ============================================
# Backend Startup Script (Produzione)
# ============================================
# Avvia solo il Backend in modalità produzione
# Usage: bash start-backend.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"

echo "🚀 Backend - Modalità Produzione"
echo "📂 Path: $BACKEND_DIR"

# ============================================
# Setup Backend
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚙️  Backend Setup (Hono + Prisma + Express)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$BACKEND_DIR"

# Controlla se node_modules esiste
if [ ! -d "node_modules" ]; then
    echo "📦 Installando dipendenze backend..."
    npm install
else
    echo "✓ node_modules già presente"
fi

# Build backend
echo "🔨 Building backend..."
npm run build

# ============================================
# Avvia Backend
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 Avvio Backend..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm start
