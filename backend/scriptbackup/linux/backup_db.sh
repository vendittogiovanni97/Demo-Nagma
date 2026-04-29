#!/bin/bash
# ============================================================
# BACKUP AUTOMATICO DATABASE - LINUX
# ============================================================
# PREREQUISITI:
#   - Docker installato e avviato
#   - Container MariaDB/MySQL in esecuzione
# ============================================================

# ---- CONFIGURAZIONE - MODIFICA QUI -------------------------
CONTAINER_NAME="mariadb_agilae"          # docker ps → colonna NAMES
DB_NAME="arpac"                          # nome del database
DB_USER="root"                           # utente database
DB_PASS="root123"                        # password database
BACKUP_DIR="/home/tuoutente/backup/db"   # cartella dove salvare i dump
RETENTION_DAYS=7                         # giorni di backup da conservare
# ------------------------------------------------------------

DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_$DATE.sql"

# Crea la cartella se non esiste
mkdir -p "$BACKUP_DIR"

echo "Inizio backup $DB_NAME..."

docker exec "$CONTAINER_NAME" mariadb-dump -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
    echo "Backup completato: $BACKUP_FILE ($SIZE)"
else
    echo "ERRORE: backup fallito!"
    exit 1
fi

# Rotazione: elimina backup più vecchi di $RETENTION_DAYS giorni
echo "Pulizia backup vecchi..."
find "$BACKUP_DIR" -name "${DB_NAME}_*.sql" -mtime +$RETENTION_DAYS -delete
echo "Pulizia completata. Tutto ok!"


# ============================================================
# SCHEDULER - CRON (03:00 ogni notte)
# ============================================================
# 1. Rendi lo script eseguibile:
#       chmod +x /percorso/backup_db.sh
#
# 2. Apri crontab:
#       crontab -e
#
# 3. Aggiungi questa riga in fondo:
#       0 3 * * * /percorso/backup_db.sh >> /var/log/backup_db.log 2>&1
#
# 4. Verifica che sia attivo:
#       crontab -l
# ============================================================
