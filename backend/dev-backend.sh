#!/bin/bash

# ============================================
# Backend Dev Script (Hot Reload)
# ============================================
# Avvia il Backend in dev mode con nodemon
# Usage: bash dev-backend.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"

echo "🔥 Backend - Modalità Sviluppo (Hot Reload)"
echo "📂 Path: $BACKEND_DIR"

# ============================================
# Setup Backend
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚙️  Backend Setup (Hono + Prisma)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$BACKEND_DIR"

# Controlla se node_modules esiste
if [ ! -d "node_modules" ]; then
    echo "📦 Installando dipendenze backend..."
    npm install
else
    echo "✓ node_modules già presente"
fi

# ============================================
# Avvia Backend in Dev Mode
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 Avvio Backend Dev (nodemon active)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔥 Hot Reload ATTIVO"
echo "   Modifica src/ → auto-rebuild con nodemon"
echo ""
echo "🔌 Backend: http://localhost:3001"
echo ""
echo "⏹️  Per fermare: Ctrl+C"
echo ""

npm run dev
