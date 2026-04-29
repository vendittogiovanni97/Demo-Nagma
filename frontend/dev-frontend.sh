#!/bin/bash

# ============================================
# Frontend Dev Script (Hot Reload)
# ============================================
# Avvia il Frontend in dev mode con next dev
# Usage: bash dev-frontend.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

echo "🔥 Frontend - Modalità Sviluppo (Hot Reload)"
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

# ============================================
# Avvia Frontend in Dev Mode
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 Avvio Frontend Dev (next dev active)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔥 Hot Reload ATTIVO"
echo "   Modifica src/ → auto-refresh nel browser"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "⏹️  Per fermare: Ctrl+C"
echo ""

npm run dev
