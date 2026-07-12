#!/bin/sh
set -e

echo "[entrypoint] Applico le migration dello schema (prisma migrate deploy)..."
npx prisma migrate deploy

if [ "$RUN_SEEDS" = "true" ]; then
  echo "[entrypoint] Eseguo il seed dei dati di default..."
  npx prisma db seed || echo "[entrypoint] Seed non riuscito: continuo comunque l'avvio."
fi

echo "[entrypoint] Avvio del server applicativo..."
exec node dist/src/index.js
