#!/usr/bin/env zsh

# Carica profilo zsh utente se presente
[ -f ~/.zshrc ] && source ~/.zshrc 2>/dev/null
[ -f ~/.zprofile ] && source ~/.zprofile 2>/dev/null

# Aggiungi i path standard di macOS, Homebrew, NVM e Node
export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/local/opt/node/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node 2>/dev/null | tail -n 1)/bin:$PATH"

# Trova la directory del progetto dinamicamente su qualsiasi Mac
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ -f "$SCRIPT_DIR/package.json" ]; then
  cd "$SCRIPT_DIR"
elif [ -d "$HOME/Documents/Demo-Nagma" ]; then
  cd "$HOME/Documents/Demo-Nagma"
elif [ -d "$HOME/Desktop/Demo-Nagma" ]; then
  cd "$HOME/Desktop/Demo-Nagma"
elif [ -d "$SCRIPT_DIR/Demo-Nagma" ]; then
  cd "$SCRIPT_DIR/Demo-Nagma"
else
  cd "$SCRIPT_DIR"
fi

echo "🚀 Avvio di Demo-Nagma (Backend + Frontend)..."
echo "📂 Directory: $(pwd)"
echo ""

npm run start
