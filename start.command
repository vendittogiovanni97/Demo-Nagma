#!/usr/bin/env zsh

# Posizionati nella directory root del progetto
cd "$(dirname "$0")"

# Aggiungi i path standard di macOS/Homebrew per trovare node e npm
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

echo "🚀 Avvio di Demo-Nagma (Backend + Frontend)..."
echo "📂 Directory: $(pwd)"
echo ""

npm run start
