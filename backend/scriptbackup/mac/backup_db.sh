#!/bin/bash
# ============================================================
# BACKUP AUTOMATICO DATABASE - MAC
# ============================================================
# PREREQUISITI:
#   - Docker Desktop installato e avviato
#   - Container MariaDB/MySQL in esecuzione
# ============================================================

# ---- CONFIGURAZIONE - MODIFICA QUI -------------------------
CONTAINER_NAME="mariadb_agilae"              # docker ps → colonna NAMES
DB_NAME="arpac"                              # nome del database
DB_USER="root"                               # utente database
DB_PASS="root123"                            # password database
BACKUP_DIR="$HOME/backup/db"                 # cartella dove salvare i dump
RETENTION_DAYS=7                             # giorni di backup da conservare
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
# SCHEDULER - LAUNCHAGENT MAC (03:00 ogni notte)
# ============================================================
# 1. Rendi lo script eseguibile:
#       chmod +x /percorso/backup_db.sh
#
# 2. Crea il file plist:
#       nano ~/Library/LaunchAgents/com.backup.db.plist
#
# 3. Incolla questo contenuto (aggiorna il percorso dello script):
#
#   <?xml version="1.0" encoding="UTF-8"?>
#   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
#     "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
#   <plist version="1.0">
#   <dict>
#       <key>Label</key>
#       <string>com.backup.db</string>
#       <key>ProgramArguments</key>
#       <array>
#           <string>/bin/bash</string>
#           <string>/percorso/backup_db.sh</string>
#       </array>
#       <key>StartCalendarInterval</key>
#       <dict>
#           <key>Hour</key>
#           <integer>3</integer>
#           <key>Minute</key>
#           <integer>0</integer>
#       </dict>
#       <key>StandardOutPath</key>
#       <string>/tmp/backup_db.log</string>
#       <key>StandardErrorPath</key>
#       <string>/tmp/backup_db_error.log</string>
#   </dict>
#   </plist>
#
# 4. Attiva il LaunchAgent:
#       launchctl load ~/Library/LaunchAgents/com.backup.db.plist
#
# 5. Verifica:
#       launchctl list | grep com.backup.db
# ============================================================
