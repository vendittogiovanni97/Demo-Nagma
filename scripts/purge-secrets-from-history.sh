#!/usr/bin/env bash
#
# Purga i file .env (e i segreti) dall'INTERA cronologia git.
#
# ⚠️  OPERAZIONE DISTRUTTIVA E IRREVERSIBILE — RISCRIVE LA HISTORY ⚠️
# Va eseguita a mano, in coordinamento con TUTTO il team, DOPO:
#   1. aver ruotato tutti i segreti esposti (JWT_SECRET, password DB, seed);
#   2. aver committato la rimozione dei .env dal tracking (git rm --cached);
#   3. aver avvisato il team che dovrà ri-clonare o eseguire un reset forzato.
#
# NON è eseguito automaticamente da Claude proprio perché riscrive la history
# condivisa e richiede un force-push su tutti i branch/tag.
#
set -euo pipefail

echo "==> Verifica che git-filter-repo sia installato"
if ! command -v git-filter-repo >/dev/null 2>&1; then
  echo "git-filter-repo non trovato. Installa con uno di:"
  echo "  pipx install git-filter-repo    # consigliato"
  echo "  brew install git-filter-repo"
  echo "  pip install git-filter-repo"
  exit 1
fi

echo "==> Backup di sicurezza del repo (mirror) prima di riscrivere la history"
REPO_DIR="$(git rev-parse --show-toplevel)"
BACKUP_DIR="${REPO_DIR}.backup-$(date +%Y%m%d-%H%M%S).git"
git clone --mirror "$REPO_DIR" "$BACKUP_DIR"
echo "    Backup creato in: $BACKUP_DIR"

echo "==> Rimozione dei file .env da tutta la history"
# Aggiungi qui eventuali altri path sensibili da purgare.
git filter-repo --force \
  --path backend/.env \
  --path frontend/.env \
  --path backend/.env.production \
  --path frontend/.env.production \
  --invert-paths

echo
echo "==> FATTO localmente. Passi successivi (MANUALI):"
echo "  1. Verifica che i .env non compaiano più:  git log --all --oneline -- backend/.env frontend/.env"
echo "  2. Ri-aggiungi il remote se git-filter-repo lo ha rimosso:"
echo "       git remote add origin <URL_REMOTE>"
echo "  3. Force-push di tutti i branch e tag (coordinato col team!):"
echo "       git push origin --force --all"
echo "       git push origin --force --tags"
echo "  4. Tutti i membri del team devono RI-CLONARE il repository."
echo "  5. Invalida/ruota comunque i segreti: una volta pushati, vanno considerati compromessi."
