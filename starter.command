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

# 1. Verifica dipendenze (se mancano node_modules)
if [ ! -d "node_modules" ] || [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
  echo ""
  echo "📦 Dipendenze mancanti rilevate. Installazione in corso..."
  npm run install:all
  if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Errore durante l'installazione delle dipendenze."
    echo "Premi un tasto qualsiasi per uscire..."
    read -k 1 -s
    exit 1
  fi
fi

# 2. Verifica build (se manca la compilazione del backend o del frontend)
if [ ! -d "backend/dist" ] || [ ! -d "frontend/.next" ]; then
  echo ""
  echo "🏗️  Compilazione del progetto in modalità PRODUZIONE in corso..."
  echo "   (Questa operazione avviene solo al primo avvio o dopo un aggiornamento)"
  npm run build
  if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Errore durante la compilazione."
    echo "Premi un tasto qualsiasi per uscire..."
    read -k 1 -s
    exit 1
  fi
  echo "✅ Compilazione completata con successo!"
fi

# 3. Libera eventuali vecchi processi rimasti bloccati in background sulle porte 3000 e 3001
STALE_PIDS=$(lsof -ti :3000,3001 2>/dev/null)
if [ -n "$STALE_PIDS" ]; then
  echo ""
  echo "🧹 Chiusura vecchie istanze rimaste in background..."
  kill -9 $STALE_PIDS 2>/dev/null || true
  sleep 1
fi

echo ""
echo "================================================================="
echo "  ⚡ DEMO-NAGMA ATTIVO (MODALITÀ PRODUZIONE - ALTE PRESTAZIONI)"
echo "================================================================="
echo "  🌐 Frontend: http://localhost:3000"
echo "  🔌 Backend:  http://localhost:3001"
echo "  💡 Per fermare il server, chiudi semplicemente questa finestra."
echo "================================================================="
echo ""

# Avvio del server in modalità produzione ottimizzata
npm run start

EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
  echo ""
  echo "❌ Il server si è interrotto con codice d'uscita $EXIT_CODE."
  echo "Premi un tasto qualsiasi per chiudere la finestra..."
  read -k 1 -s
fi
