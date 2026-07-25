#!/bin/zsh

set -u

SCRIPT_DIRECTORY="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIRECTORY="$SCRIPT_DIRECTORY/backend"
PG_DUMP_PATH=""

clear
echo "=========================================="
echo "       BACKUP DATABASE DEMO-NAGMA"
echo "=========================================="
echo

if [[ ! -d "$BACKEND_DIRECTORY" ]]; then
  echo "ERRORE: cartella backend non trovata."
  echo "$BACKEND_DIRECTORY"
  echo
  read -k 1 "?Premi un tasto per chiudere..."
  echo
  exit 1
fi

PG_DUMP_CANDIDATES=(
  "/Library/PostgreSQL/18/bin/pg_dump"
  "/Applications/Postgres.app/Contents/Versions/latest/bin/pg_dump"
  "/opt/homebrew/opt/libpq/bin/pg_dump"
  "/opt/homebrew/bin/pg_dump"
  "/usr/local/bin/pg_dump"
)

for CANDIDATE in "${PG_DUMP_CANDIDATES[@]}"; do
  if [[ -x "$CANDIDATE" ]]; then
    PG_DUMP_PATH="$CANDIDATE"
    break
  fi
done

if [[ -z "$PG_DUMP_PATH" ]] && command -v pg_dump >/dev/null 2>&1; then
  PG_DUMP_PATH="$(command -v pg_dump)"
fi

if [[ -z "$PG_DUMP_PATH" ]]; then
  echo "ERRORE: pg_dump non trovato."
  echo "Completa l'installazione di PostgreSQL 18.4 e riprova."
  echo
  read -k 1 "?Premi un tasto per chiudere..."
  echo
  exit 1
fi

export DB_BACKUP_PG_DUMP_PATH="$PG_DUMP_PATH"

echo "PostgreSQL:"
"$DB_BACKUP_PG_DUMP_PATH" --version
echo
echo "Avvio backup..."
echo

cd "$BACKEND_DIRECTORY" || exit 1
node \
  -r ts-node/register \
  -r dotenv/config \
  src/core/backup/runDatabaseBackup.ts

BACKUP_EXIT_CODE=$?
echo

if [[ $BACKUP_EXIT_CODE -eq 0 ]]; then
  echo "BACKUP COMPLETATO CON SUCCESSO."
else
  echo "BACKUP NON RIUSCITO. Controlla il messaggio sopra."
fi

echo
read -k 1 "?Premi un tasto per chiudere..."
echo
exit $BACKUP_EXIT_CODE
