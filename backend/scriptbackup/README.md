# 🗄️ Script Backup Database Automatico

Script pronti per fare il backup automatico di un database MariaDB/MySQL su Docker.
Funziona su **Windows**, **Mac** e **Linux**.

---

## 📁 Struttura

```
scriptbackup/
├── README.md          ← sei qui
├── windows/
│   └── backup_db.ps1  ← script PowerShell + istruzioni Task Scheduler
├── mac/
│   └── backup_db.sh   ← script Bash + istruzioni LaunchAgent
└── linux/
    └── backup_db.sh   ← script Bash + istruzioni Cron
```

---

## ⚙️ Configurazione (uguale per tutti)

Prima di usare uno script, apri il file e modifica la sezione **CONFIGURAZIONE** in cima:

| Variabile | Descrizione | Esempio |
|---|---|---|
| `CONTAINER_NAME` | Nome del container Docker | `mariadb_agilae` |
| `DB_NAME` | Nome del database | `arpac` |
| `DB_USER` | Utente del database | `root` |
| `DB_PASS` | Password del database | `root123` |
| `BACKUP_DIR` | Cartella dove salvare i dump | vedi ogni script |

> 💡 Per trovare il nome del container: `docker ps` → colonna **NAMES**

---

## 🔄 Cosa fa lo script

1. Esegue il dump del DB con `mariadb-dump` dentro il container Docker
2. Salva il file `.sql` con data e ora nel nome → es. `arpac_2025-01-20_03-00-00.sql`
3. Cancella automaticamente i backup più vecchi di **7 giorni**

---

## 🕒 Orario consigliato

**03:00 di notte** — quando il server è scarico. Cambiabile nelle istruzioni di ogni script.

---

## 🧪 Test rapido

Prima di attivare lo scheduler, esegui lo script manualmente e verifica che:
- ✅ Viene creato un file `.sql` nella cartella backup
- ✅ Il file non è vuoto
- ✅ Dopo 7 giorni i vecchi file vengono cancellati
