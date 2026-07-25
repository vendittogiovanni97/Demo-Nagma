#!/usr/bin/env zsh

# Posizionati nella directory root del progetto Demo-Nagma
PROJECT_DIR="/Users/giovannivenditto/Documents/Demo-Nagma"

if [ -d "$PROJECT_DIR" ]; then
  cd "$PROJECT_DIR"
else
  cd "$(dirname "$0")"
fi

# Aggiungi i path standard di macOS/Homebrew per trovare node e npm
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

echo "🚀 Avvio di Demo-Nagma (Backend + Frontend)..."
echo "📂 Directory: $(pwd)"
echo ""

npm run start
