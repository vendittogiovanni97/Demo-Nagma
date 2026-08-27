#!/usr/bin/env zsh

# Posizionamento automatico nella cartella del progetto
cd "$(dirname "$0")"

# Caricamento delle variabili d'ambiente utente per PATH (Node, NPM, Git, Homebrew, NVM)
export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

if [ -f "$HOME/.zshrc" ]; then
  source "$HOME/.zshrc" 2>/dev/null || true
fi
if [ -f "$HOME/.bash_profile" ]; then
  source "$HOME/.bash_profile" 2>/dev/null || true
fi
if [ -f "$HOME/.nvm/nvm.sh" ]; then
  source "$HOME/.nvm/nvm.sh" 2>/dev/null || true
fi

# Pulizia dello schermo e banner di avvio
clear
echo "================================================================="
echo "  🚀 AVVIO PROGETTO DEMO-NAGMA IN CORSO..."
echo "================================================================="
echo "  🌐 Backend & Frontend in esecuzione..."
echo "  💡 Per fermare il server, chiudi semplicemente questa finestra."
echo "================================================================="
echo ""

# Avvio dei server di sviluppo
npm run dev
