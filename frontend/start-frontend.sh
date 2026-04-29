#!/bin/bash

# ============================================
# Frontend Startup Script (Produzione)
# ============================================
# Avvia solo il Frontend in modalità produzione
# Usage: bash start-frontend.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

echo "🚀 Frontend - Modalità Produzione"
echo "📂 Path: $FRONTEND_DIR"

# ============================================
# Setup Frontend
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎨 Frontend Setup (Next.js)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$FRONTEND_DIR"

# Controlla se node_modules esiste
if [ ! -d "node_modules" ]; then
    echo "📦 Installando dipendenze frontend..."
    npm install
else
    echo "✓ node_modules già presente"
fi

# Build frontend
echo "🔨 Building frontend..."
npm run build

# ============================================
# Avvia Frontend
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 Avvio Frontend..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm start
