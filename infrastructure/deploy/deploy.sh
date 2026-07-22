#!/usr/bin/env zsh
# ==============================================================================
# Script di Deploy / Aggiornamento Automatico per macOS (Demo-Nagma)
# ==============================================================================

set -e

# Colori per il terminale macOS
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Trova la cartella radice del progetto
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

echo -e "${BLUE}🔍 Controllo aggiornamenti da Git (branch main)...${NC}"

# Verifica se ci sono modifiche locali non salvate
if [ -n "$(git status --porcelain)" ]; then
  echo -e "${YELLOW}⚠️ Attenzione: Ci sono modifiche locali non committate nel repository.${NC}"
  if [ -t 0 ]; then
    read -q "REPLY?Vuoi salvare temporaneamente le modifiche locali (git stash) e proseguire? (y/n) "
    echo ""
    if [[ "$REPLY" =~ ^[Yy]$ ]]; then
      echo -e "${BLUE}📦 Salvo le modifiche locali in stash...${NC}"
      git stash
    else
      echo -e "${RED}❌ Deploy annullato per evitare di perdere modifiche locali.${NC}"
      exit 1
    fi
  else
    echo -e "${BLUE}📦 Salvo automaticamente le modifiche locali in stash...${NC}"
    git stash
  fi
fi

# Fetch delle ultime modifiche da remoto
git fetch origin main

# Controlla se il branch locale è indietro rispetto a origin/main
LOCAL_HASH=$(git rev-parse HEAD)
REMOTE_HASH=$(git rev-parse origin/main)

if [ "$LOCAL_HASH" = "$REMOTE_HASH" ]; then
  echo -e "${GREEN}✅ Il repository è già aggiornato all'ultimo commit di main (${LOCAL_HASH:0:7}).${NC}"
  exit 0
fi

echo -e "${GREEN}🚀 Trovate nuove modifiche su origin/main!${NC}"
echo "   Commit locale:  ${LOCAL_HASH:0:7}"
echo "   Commit remoto:  ${REMOTE_HASH:0:7}"

echo ""
echo -e "${BLUE}📥 1. Pull delle ultime modifiche da main...${NC}"
git checkout main
git pull origin main

echo ""
echo -e "${BLUE}📦 2. Aggiornamento dipendenze Node.js...${NC}"
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

echo ""
echo -e "${BLUE}🗄️ 3. Esecuzione migrazioni Database (Prisma)...${NC}"
cd backend && npx prisma migrate deploy && cd ..

echo ""
echo -e "${BLUE}🏗️ 4. Compilazione e Build di Backend e Frontend...${NC}"
npm run build

echo ""
echo -e "${GREEN}🎉 Deploy e aggiornamento completati con successo per Demo-Nagma!${NC}"
