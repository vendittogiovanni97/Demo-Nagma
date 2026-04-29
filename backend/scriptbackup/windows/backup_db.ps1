# ============================================================
# BACKUP AUTOMATICO DATABASE - WINDOWS
# ============================================================
# PREREQUISITI:
#   - Docker Desktop installato e avviato
#   - Container MariaDB/MySQL in esecuzione
# ============================================================

# ---- CONFIGURAZIONE - MODIFICA QUI -------------------------
$CONTAINER_NAME = "mariadb_agilae"         # docker ps → colonna NAMES
$DB_NAME        = "arpac"                  # nome del database
$DB_USER        = "root"                   # utente database
$DB_PASS        = "root123"                # password database
$BACKUP_DIR     = "C:\Backup\DB"           # cartella dove salvare i dump
$RETENTION_DAYS = 7                        # giorni di backup da conservare
# ------------------------------------------------------------

$DATE        = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$BACKUP_FILE = "$BACKUP_DIR\${DB_NAME}_$DATE.sql"

# Crea la cartella se non esiste
if (-Not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null
    Write-Host "Cartella creata: $BACKUP_DIR"
}

Write-Host "Inizio backup $DB_NAME..."

docker exec $CONTAINER_NAME mariadb-dump -u $DB_USER -p"$DB_PASS" $DB_NAME | Out-File -FilePath $BACKUP_FILE -Encoding UTF8

if ($LASTEXITCODE -eq 0) {
    $size = [math]::Round((Get-Item $BACKUP_FILE).Length / 1KB, 2)
    Write-Host "Backup completato: $BACKUP_FILE ($size KB)"
} else {
    Write-Host "ERRORE: backup fallito!"
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Rotazione: elimina backup più vecchi di $RETENTION_DAYS giorni
Write-Host "Pulizia backup vecchi..."
Get-ChildItem -Path $BACKUP_DIR -Filter "${DB_NAME}_*.sql" |
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$RETENTION_DAYS) } |
    ForEach-Object {
        Remove-Item $_.FullName
        Write-Host "Eliminato: $($_.Name)"
    }

Write-Host "Tutto ok! Premi un tasto per chiudere..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")


# ============================================================
# SCHEDULER - TASK SCHEDULER WINDOWS (03:00 ogni notte)
# ============================================================
# Esegui questi comandi in PowerShell come AMMINISTRATORE:
#
#   $action  = New-ScheduledTaskAction -Execute "powershell.exe" `
#              -Argument "-ExecutionPolicy Bypass -File `"C:\percorso\backup_db.ps1`""
#   $trigger = New-ScheduledTaskTrigger -Daily -At "03:00"
#   Register-ScheduledTask -TaskName "Backup DB notte" `
#       -Action $action -Trigger $trigger -RunLevel Highest -Force
#
# Oppure manualmente:
#   1. Windows + R → taskschd.msc
#   2. "Crea attività di base..."
#   3. Trigger: Giornaliero alle 03:00
#   4. Azione: powershell.exe
#      Argomenti: -ExecutionPolicy Bypass -File "C:\percorso\backup_db.ps1"
# ============================================================
