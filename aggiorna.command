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

# Pulizia dello schermo ed intestazione
clear
echo "================================================================="
echo "  🔄 AUTO-AGGIORNAMENTO PROGETTO DEMO-NAGMA (1-CLICK)"
echo "================================================================="
echo ""

# Lettura versione attuale dal package.json
OLD_VERSION=$(node -e "try { console.log(require('./package.json').version || '1.0.0'); } catch(e) { console.log('1.0.0'); }" 2>/dev/null)
echo "📌 Versione Attuale: v${OLD_VERSION}"
echo ""

# Download degli aggiornamenti da Git
echo "📡 Download degli ultimi aggiornamenti da GitHub in corso..."
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")

# Timeout su git pull per evitare blocchi su richiesta credenziali
GIT_TERMINAL_PROMPT=0 git pull origin "$CURRENT_BRANCH" 2>&1
GIT_EXIT=$?

if [ $GIT_EXIT -ne 0 ]; then
  echo ""
  echo "❌ ERRORE: Impossibile scaricare gli aggiornamenti da Git."
  echo "   Possibile causa: credenziali GitHub non salvate o nessuna connessione."
  echo "   Soluzione: esegui una volta dal terminale 'git pull' e salva le credenziali."
  echo ""
  echo "Premi un tasto qualsiasi per chiudere la finestra..."
  read -k 1 -s
  exit 1
fi

echo ""
echo "📦 Installazione e aggiornamento delle dipendenze npm in corso..."
npm run install:all

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ ERRORE: Impossibile completare l'installazione delle dipendenze."
  echo ""
  echo "Premi un tasto qualsiasi per chiudere la finestra..."
  read -k 1 -s
  exit 1
fi

echo ""
echo "🗄️  Applicazione migrazioni database in corso..."
npm run db:migrate:prod

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ ERRORE: Migrazione database fallita."
  echo "   Assicurati che il database sia avviato e raggiungibile."
  echo ""
  echo "Premi un tasto qualsiasi per chiudere la finestra..."
  read -k 1 -s
  exit 1
fi

echo ""
echo "🏗️  Compilazione e ottimizzazione di produzione in corso..."
npm run build

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ ERRORE: Compilazione del progetto fallita."
  echo ""
  echo "Premi un tasto qualsiasi per chiudere la finestra..."
  read -k 1 -s
  exit 1
fi

# Lettura nuova versione dal package.json
NEW_VERSION=$(node -e "try { console.log(require('./package.json').version || '1.0.0'); } catch(e) { console.log('1.0.0'); }" 2>/dev/null)

echo ""
echo "================================================================="
echo "  ✅ AGGIORNAMENTO COMPLETATO CON SUCCESSO!"
echo "================================================================="
echo "  📌 Versione precedente: v${OLD_VERSION}"
echo "  🆕 Versione attuale:    v${NEW_VERSION}"
echo "================================================================="
echo ""
echo "💡 Ora puoi avviare il progetto facendo doppio click su 'starter.command'."
echo ""
echo "Premi un tasto qualsiasi per uscire..."
read -k 1 -s
