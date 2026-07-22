# 🎨 Demo Nagma — Enterprise Tattoo Studio CRM

[![Node.js](https://img.shields.io/badge/Node.js-v22%2B-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5.x-blue.svg)](https://expressjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-v16.x-black.svg)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-v7.8-indigo.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v17-blue.svg)](https://www.postgresql.org/)
[![Material UI](https://img.shields.io/badge/MUI-v9.x-007FFF.svg)](https://mui.com/)

**Demo Nagma** è una soluzione gestionale (CRM) enterprise progettata per la gestione completa di uno studio di tatuaggi e piercing. La piattaforma unisce un potente ed affidabile backend REST in Node.js/Express con un'interfaccia utente moderna, reattiva e modulare realizzata in Next.js 16 (App Router) e Material-UI.

---

## 💡 Che Cos'è e Cosa Fa

Demo Nagma permette ai proprietari di studio, agli artisti e al personale amministrativo di digitalizzare ogni aspetto dell'attività:

### 🌟 Funzionalità Chiave

- 👤 **CRM & Anagrafica Clienti**: Scheda cliente dettagliata con note mediche/allergie, storico trattamenti, preferenze sui tatuaggi e gestione degli allegati (consenso, bozze grafiche).
- 📅 **Agenda & Calendario Interattivo**: Vista calendario avanzata (FullCalendar e AG-Grid) con codifica colore per artista, gestione slot temporali, durate e stati appuntamento (Confermato, In Corso, Completato, Annullato).
- 👥 **Gestione Staff & Turni**: Anagrafica collaboratori ed apprendisti, assegnazione turni di lavoro e assenze.
- 💰 **Modulo Finanze & Spese Libere**: Tracciamento di entrate, uscite e pagamenti per metodo di pagamento, gestione delle spese correnti dello studio e grafici di trend.
- 📋 **Consensi Informati & Modelli Form**: Compilazione e generazione PDF automatica (PDFKit) per consensi informati e schede di trattamento.
- 🧴 **Trattamenti & Creme Post-Tatuaggio**: Catalogazione e associazione dei prodotti di cura post-trattamento da consigliare al cliente.
- 💬 **Messaggistica WhatsApp**: Integrazione con template messaggi personalizzati per promemoria appuntamenti ed iscrizioni.
- 📊 **Esportazione Reportistica**: Esportazione istantanea dei dati finanziari e dei clienti in formato **Excel** (`.xlsx`), **PDF** e **CSV UTF-8 BOM**.
- ⚙️ **Configurazione Dinamica**: Gestione flessibile delle impostazioni dello studio caricate dinamicamente dal database con caching ad alte prestazioni.

---

## 🏛️ Architettura e Stack Tecnologico

Il progetto segue una struttura pulita e modulare:

```
Demo-Nagma/
├── backend/                   # Node.js 22+ & Express 5 API Server
│   ├── src/
│   │   ├── core/              # Container DI, Middleware di sicurezza/errori, Logger, Utility Prisma
│   │   ├── modules/           # Moduli di business (Auth, Customer, Booking, Staff, Finance, ecc.)
│   │   └── routes.ts          # Registro rotte centralizzato Express
│   └── prisma/                # Schema Prisma, Migrazioni e Script di Seed
├── frontend/                  # Next.js 16 App Router & React 19 Frontend
│   ├── src/
│   │   ├── app/               # Rotte e pagine Next.js
│   │   ├── modules/           # Componenti, Custom Hook (SWR) e Client API HTTP
│   │   └── common/            # Design System MUI, Token tema, Context globale
├── infrastructure/
│   ├── docker/                # Configurazione Docker Compose per PostgreSQL 17
│   └── deploy/                # Script bash di deploy automatico per macOS
├── start.command              # Script di avvio rapido con doppio clic su macOS
└── package.json               # Monorepo Orchestration Scripts
```

| Layer | Tecnologie Utilizzate |
|---|---|
| **Backend API** | Node.js 22+, Express 5, Prisma 7.8, PostgreSQL 17, Zod 4, JWT, ExcelJS, PDFKit |
| **Frontend App** | Next.js 16 (App Router), React 19, Material-UI 9, AG-Grid 32, SWR, Lucide-React |
| **Infrastruttura** | Docker Desktop, Docker Compose, Bash/Zsh Automation |
| **Testing** | Jest (Backend Unit Tests), Playwright & Vitest (Frontend E2E) |

---

## 🚀 Guida Passo-Passo all'Installazione ed Avvio

### 1️⃣ Prerequisiti e Installazione degli Strumenti

Prima di iniziare, assicurati di aver installato i due strumenti principali necessari:

#### 🔹 1. Node.js (v22+ o superiore) e npm
Puoi installare Node.js tramite uno dei seguenti metodi:

- **Via Homebrew (macOS consigliato)**:
  Se non hai ancora Homebrew installato sul Mac, installalo eseguendo:
  ```bash
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  ```
  Successivamente installa Node.js:
  ```bash
  brew install node
  ```
- **Via NVM (Node Version Manager)**:
  ```bash
  nvm install 22 && nvm use 22
  ```
- **Via Installer Ufficiale**: [Scarica l'installer ufficiale di Node.js](https://nodejs.org/it/download)

Verifica le versioni installate:
```bash
node -v   # Deve mostrare v22.x.x o superiore
npm -v    # Deve mostrare 10.x.x o superiore
```

#### 🔹 2. Docker Desktop (per il database PostgreSQL 17)
Docker è necessario per eseguire il container del database senza dover configurare manualmente PostgreSQL sul tuo computer.

- 📥 **Link per il Download**: [Scarica Docker Desktop](https://www.docker.com/products/docker-desktop/) *(disponibile per macOS Apple Silicon M1/M2/M3/M4, macOS Intel e Windows)*.

> [!IMPORTANT]
> Dopo aver installato Docker Desktop, assicurati di aprirlo e lasciarlo in esecuzione in background prima di procedere con l'avvio del database.


### 2️⃣ Installazione delle Dipendenze
Dalla radice del progetto, esegui il comando unico per installare tutte le dipendenze (root, backend e frontend):

```bash
npm run install:all
```

---

### 3️⃣ Configurazione delle Variabili d'Ambiente
Copia i file di modello `.env.example` per creare i file `.env` di sviluppo sia nel backend che nel frontend:

```bash
# Configurazione Backend
cp backend/.env.example backend/.env

# Configurazione Frontend
cp frontend/.env.example frontend/.env
```

---

### 4️⃣ Avvio del Database PostgreSQL (Docker)
Avvia il container PostgreSQL sulla porta `5433`:

```bash
npm run db:up
```

> [!TIP]
> Per verificare lo stato del container usa `docker ps` o ferma il DB in qualsiasi momento con `npm run db:down`.

---

### 5️⃣ Migrazione e Popolamento del Database (Seed)

Applica le migrazioni Prisma per creare lo schema delle tabelle:

```bash
npm run db:migrate
```

Inserisci i dati iniziali di sistema (Account Admin, Staff e Config):

```bash
npm run db:seed
```

*(Opzionale)* Inserisci i dati di test e clienti demo per provarne subito le funzionalità:

```bash
npm run db:seed:demo
```

---

### 6️⃣ Avvio dell'Applicazione

#### Modalità Sviluppo (Dev Server):
Avvia contemporaneamente Backend su `http://localhost:3001` e Frontend su `http://localhost:3000`:

```bash
npm run dev
```

#### Modalità Produzione:
```bash
npm run build
npm run start
```

#### 🍏 Avvio Rapido per Utenti macOS (Doppio Clic):
Se sei su macOS, puoi avviare l'intero sistema semplicemente facendo **doppio clic sul file [`start.command`](file:///Users/giovannivenditto/Documents/Demo-Nagma/start.command)** presente nella radice del progetto.

---

## 🛠️ Registro Completo dei Comandi (Root `package.json`)

Tutti i comandi principali possono essere eseguiti direttamente dalla cartella radice del progetto:

| Comando | Descrizione |
|---|---|
| `npm run dev` | Avvia Backend (:3001) e Frontend (:3000) in modalità sviluppo in parallelo |
| `npm run start` | Avvia Backend e Frontend in modalità produzione |
| `npm run build` | Compila TypeScript ed esegue il build sia del backend che del frontend |
| `npm run install:all` | Installa le dipendenze npm per root, backend e frontend |
| `npm run db:up` | Avvia il container Docker PostgreSQL |
| `npm run db:down` | Ferma il container Docker PostgreSQL |
| `npm run db:migrate` | Esegue le migrazioni Prisma per aggiornare lo schema del DB |
| `npm run db:seed` | Inserisce i dati di base del sistema (Admin, Staff, Config) |
| `npm run db:seed:demo` | Inserisce i dati demo di prova (Clienti, Appuntamenti, Finanze) |
| `npm run typecheck` | Esegue la verifica dei tipi TypeScript su backend e frontend |
| `npm run test` | Esegue la suite di test unitari backend con Jest (16 suite, 134 test) |
| `npm run clean` | Elimina le cartelle di build `dist` e `.next` |
| `npm run deploy` | Script di aggiornamento e deploy automatico da Git `main` (macOS) |

---

## 🔄 Deploy e Aggiornamento Automatico

Il progetto include uno script di deploy automatizzato situato in [`infrastructure/deploy/deploy.sh`](file:///Users/giovannivenditto/Documents/Demo-Nagma/infrastructure/deploy/deploy.sh).

Per aggiornare la tua installazione all'ultimo commit del branch `main`, esegui semplicemente:

```bash
npm run deploy
```

Lo script eseguirà automaticamente:
1. Verifica delle modifiche locali (con stashing automatico in caso di file non committati).
2. `git fetch` e `git pull origin main`.
3. Aggiornamento delle dipendenze per root, backend e frontend.
4. Esecuzione delle migrazioni del DB Prisma (`npx prisma migrate deploy`).
5. Ricompilazione e build completa del progetto.

---

## 🧪 Qualità del Codice e Test

Prima di effettuare un commit o considerare completato un task, verifica sempre la correttezza del codice:

```bash
# 1. Verifica errori di tipo TypeScript
npm run typecheck

# 2. Test Unitari Backend (Jest)
npm run test

# 3. Security Audit OWASP Backend
cd backend && npx jest test/security/ --forceExit

# 4. End-to-End Test Frontend (Playwright)
cd frontend && npx playwright test --project=chromium
```

---

## ❓ Risoluzione Problemi (Troubleshooting)

> [!WARNING]
> **Errore di connessione al Database (`P1001`)**:
> Assicurati che Docker Desktop sia attivo e che la porta `5433` sia libera. Esegui `npm run db:up`.

> [!NOTE]
> **Errore di permessi su macOS per `start.command` o `deploy.sh`**:
> Se macOS blocca l'esecuzione dello script, assegna i permessi di esecuzione dal terminale:
> ```bash
> chmod +x start.command infrastructure/deploy/deploy.sh
> ```

---

## 📄 Licenza

Questo progetto è di proprietà di **Demo Nagma**. Tutti i diritti riservati.

---

## 🔑 Credenziali di Primo Accesso (Default Seed)

Dopo aver eseguito il seed del database (`npm run db:seed`), gli account amministrativi di default per accedere alla web app sono:

- 👑 **Super Admin**: `superadmin@nagma.it` | Password: `superadmin123`
- 👤 **Admin (Miriam)**: `miriam@nagma.it` | Password: `Nagmatattoo1926!`
- 👤 **Admin (Giuseppe)**: `giuseppe@nagma.it` | Password: `Nagmatattoo1926!`

