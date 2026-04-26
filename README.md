# Nagma Tattoo CRM

Gestionale completo per studi di tatuaggi. Clienti, agenda, turni team, finanze e WhatsApp — tutto in un unico posto.

## Stack

| Layer | Tecnologie |
|-------|-----------|
| Frontend | Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · SWR |
| Backend | Express 5 · TypeScript · Prisma 7 · PostgreSQL 17 |
| Infra | Docker · Docker Compose |

---

## Avvio rapido (Docker — per il cliente)

```bash
# 1. Vai nella cartella del progetto
cd Demo-Nagma

# 2. Avvia tutto (primo avvio: ~2-3 min)
docker compose up --build

# 3. Apri il browser
http://localhost:3000
```

## Sviluppo locale

### Prerequisiti
- Node.js >= 24
- Docker Desktop (per PostgreSQL)

### 1. Avvia solo il database

```bash
cd backend
docker compose up -d
```

### 2. Backend

```bash
cd backend
npm install
npm run db:seed      # popola DB con admin e dati iniziali
npm run dev          # http://localhost:3001
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev          # http://localhost:3000
```

---

## Prisma 7 — Gestione database

### 🔑 Cosa devi sapere su Prisma 7

**Prisma 7** è una versione completamente riscritta con architettura a microservizi. Differenze chiave da v6:

| Aspetto | Prisma 6 | Prisma 7 |
|---------|----------|---------|
| **Config** | `prisma/schema.prisma` | `prisma.config.ts` + `schema.prisma` |
| **URL database** | `schema.prisma` → `datasource.url` | **`prisma.config.ts`** → `datasource.url` |
| **Adapter** | Non esiste | **@prisma/adapter-pg** per PostgreSQL nativo |
| **Client** | Importa da `@prisma/client` | Stesso (generato automaticamente) |

### 📋 File principali

```
backend/
├── prisma.config.ts           # ⭐ NUOVO: Configurazione Prisma 7
├── prisma/
│   ├── schema.prisma          # Schema (senza url!)
│   └── seed.ts                # Seed dati iniziali
└── src/
    └── db.ts                  # ⭐ NUOVO: Istanza PrismaClient con adapter
```

### 🚀 Comandi Prisma — Con spiegazione

```bash
# ════════════════════════════════════════════════════════════════
# 1️⃣  GENERARE IL CLIENT (eseguire SOLO una volta)
# ════════════════════════════════════════════════════════════════
npx prisma generate
# Cosa fa:
# • Legge schema.prisma
# • Genera TypeScript types in node_modules/@prisma/client
# • Crea il PrismaClient con tutti i model type-safe
# ⚠️  DEVE essere eseguito PRIMA di qualsiasi operazione database

# ════════════════════════════════════════════════════════════════
# 2️⃣  PUSH SCHEMA AL DATABASE (development rapido)
# ════════════════════════════════════════════════════════════════
npx prisma db push
# Cosa fa:
# • Sincronizza schema.prisma direttamente al database
# • NON crea file di migrazione
# • ⚡ Più veloce per development iterativo
# ⚠️  NON per produzione (usa migrate deploy invece)

# ════════════════════════════════════════════════════════════════
# 3️⃣  CREARE UNA MIGRAZIONE (for production-safe changes)
# ════════════════════════════════════════════════════════════════
npx prisma migrate dev --name aggiungere_campoX
# Cosa fa:
# • Crea file migrazione in prisma/migrations/
# • Applica la migrazione al database locale
# • Genera Prisma Client types
# Esempio nomi:
#   --name add_email_field
#   --name create_shifts_table
#   --name soft_delete_users

# ════════════════════════════════════════════════════════════════
# 4️⃣  APPLICARE MIGRAZIONI IN PRODUZIONE
# ════════════════════════════════════════════════════════════════
npx prisma migrate deploy
# Cosa fa:
# • Applica TUTTE le migrazioni che ancora non sono applicate
# • Nessun prompt interattivo (sicuro per CI/CD)
# • ⚠️  Usa SOLO in produzione, non in development

# ════════════════════════════════════════════════════════════════
# 5️⃣  POPULARE DATABASE (seeding)
# ════════════════════════════════════════════════════════════════
npm run db:seed
# Cosa fa:
# • Esegue prisma/seed.ts
# • Inserisce dati iniziali (admin, staff, template)
# • Usa PrismaClient con adapter-pg

# ════════════════════════════════════════════════════════════════
# 6️⃣  RESET COMPLETO DATABASE (⚠️  Cancella tutto!)
# ════════════════════════════════════════════════════════════════
npm run db:reset
# Cosa fa:
# • 🔥 Elimina TUTTO il database
# • Riesegue TUTTE le migrazioni da zero
# • Esegue seed (db:seed)
# ⚠️  Usa SOLO in development quando schema è rotto

# ════════════════════════════════════════════════════════════════
# 7️⃣  ESPLORARE DATI (UI Web)
# ════════════════════════════════════════════════════════════════
npx prisma studio
# Cosa fa:
# • Apre http://localhost:5555
# • Interface grafica per visualizzare/editare dati
# • Perfetto per debugging e test

# ════════════════════════════════════════════════════════════════
# 8️⃣  VISUALIZZARE MIGRAZIONI
# ════════════════════════════════════════════════════════════════
npx prisma migrate status
# Mostra:
# • Migrazioni applicate ✅
# • Migrazioni pending ⏳
# • Data di applicazione
```

### 📊 Workflow tipico di development

```bash
# Inizio giornata — database pulito
npm run db:reset
npm run dev

# Durante development — nuova feature con tabella
# 1. Modifica schema.prisma
# 2. Crea migrazione
npx prisma migrate dev --name aggiungere_feature

# 3. Codice TypeScript automaticamente type-safe 🎉
# 4. Testa feature

# Se schema è "rotto" durante development
npm run db:reset

# Prima di git push
npx prisma migrate status  # verifica pending migrations
git add prisma/migrations/ # commit migration file
```

### 🛠️ Troubleshooting Prisma

**❌ Errore: "PrismaClientInitializationError"**
```bash
# Soluzione: Genera il client
npx prisma generate
```

**❌ Errore: "Unknown argument" in seed**
```bash
# Causa: Schema è cambiato ma client non è rigenerato
# Soluzione:
npm run db:reset
```

**❌ Migrazioni "stuck" in pendenza**
```bash
npx prisma migrate status       # vedi cosa è pending
npx prisma migrate resolve --rolled-back <migration_name>  # reset migration
npx prisma migrate dev          # ricrea da zero
```

**❌ Disconnessione database durante seed**
```bash
# Verifica DATABASE_URL in .env
cat .env | grep DATABASE_URL
# Verifica che Docker PostgreSQL è running
docker compose ps
```

### 📚 Comandi npm (package.json shortcuts)

```bash
npm run db:seed          # = tsx prisma/seed.ts
npm run db:migrate       # = prisma migrate dev
npm run db:migrate:prod  # = prisma migrate deploy
npm run db:reset         # = prisma migrate reset + seed
npm run db:push          # = prisma db push
npm run db:studio        # = prisma studio
```

---

## 🔧 Gestione Centralizzata della Configurazione

### Introduzione alla Config Table

A partire da Aprile 2026, tutti i parametri di configurazione sono gestiti centralmente nella tabella `Config` del database. Questo approccio offre:

- **Dinamicità:** Cambiare parametri senza riavviare il server
- **Sicurezza:** Password e segreti vivono solo nel database, mai nel codice
- **Type-safety:** TypeScript getters garantiscono accesso tipizzato
- **Performance:** TTL-based caching (5 minuti default) riduce accessi al DB
- **Tracciabilità:** Tutte le configurazioni sono versionabili e auditable

### Parametri Centralizzati

| Parametro | Tipo | Default | Descrizione |
|-----------|------|---------|-------------|
| `FILES_PATH` | string | `/uploads/attachments/` | Cartella allegati |
| `DEBUG_HTTP` | boolean | `false` | Abilita debug logging HTTP |
| `LOG_LEVEL` | string | `INFO` | Livello logging (DEBUG, INFO, WARN, ERROR) |
| `JWT_EXPIRY` | string | `8h` | Durata token JWT |
| `BCRYPT_SALT_ROUNDS` | number | `10` | Round bcrypt per password hashing |
| `LOGIN_RATE_LIMIT_WINDOW_MINUTES` | number | `15` | Finestra temporale rate limit login |
| `LOGIN_RATE_LIMIT_MAX_ATTEMPTS` | number | `5` | Tentativi massimi prima blocco |
| `SESSION_TIMEOUT_MINUTES` | number | `30` | Timeout sessione |
| `MAX_PAGE_LIMIT` | number | `100` | Limite massimo items per pagina |
| `APP_VERSION` | string | `1.0.0` | Versione applicazione |
| `BOOKING_UPDATE_PASSWORD` | string | *(nessuno)* | **Password per modificare prenotazioni** ⚠️ |

### ConfigService — Come Usarlo

#### Setup al Boot (initializeConfig)

Nel file `src/index.ts`, il ConfigService viene inizializzato al startup:

```typescript
import { configService } from '@/services/config.service';

async function startServer() {
  // Carica TUTTI i config dal DB in memoria (critical config + cache)
  await configService.initializeConfig();
  
  // Ora i getters sincronistici sono disponibili
  const logLevel = configService.getLogLevelSync();
  
  // Avvia server
  app.listen(PORT);
}
```

#### Runtime — Getters Asincroni con Cache

Per accessi durante richieste HTTP, usa i getter asincroni (con caching TTL di 5 minuti):

```typescript
// Nel controller o service
async function someHandler() {
  const jwtExpiry = await configService.getJwtExpiry();      // '8h'
  const saltRounds = await configService.getBcryptSaltRounds(); // 10
  const logLevel = await configService.getLogLevel();         // 'INFO'
}
```

#### Boot-Time — Getters Sincroni (post-initializeConfig)

Per accessi sincronistici dopo boot (middleware, startup logging):

```typescript
// Nel middleware (durante richiesta)
function someMiddleware(req, res, next) {
  const shouldLogHttp = configService.getDebugHttpSync();
  const maxPageLimit = configService.getMaxPageLimitSync();
}
```

### 🔐 Sicurezza: Password nel Database, Mai nel Codice

**IMPORTANTE:** Password come `BOOKING_UPDATE_PASSWORD` vivono **SOLO** nel database, mai nel codebase.

#### Come impostare la password al primo seed

**1. Impostare la variabile d'ambiente:**
```bash
export BOOKING_UPDATE_PASSWORD="nagmatatto12"
npm run db:seed
```

**2. Verificare nel database (Prisma Studio):**
```bash
npx prisma studio
# Vai su Config → verifica che BOOKING_UPDATE_PASSWORD è presente
```

**3. Verificare nel codice — Nessun hardcoded default!**
```typescript
// ✅ CORRETTO: seed.ts
value: process.env.BOOKING_UPDATE_PASSWORD || '', // fallback vuoto

// ❌ SBAGLIATO: NON fare mai
value: process.env.BOOKING_UPDATE_PASSWORD || 'nagmatatto12', // VIETATO!
```

#### Se password non è configurata

Se `BOOKING_UPDATE_PASSWORD` non è impostata nel DB, l'API ritorna:

```json
{
  "statusCode": 503,
  "message": "Password non configurata. Contattare l'amministratore.",
  "errorCode": "PASSWORD_NOT_CONFIGURED"
}
```

### Workflow Tipico

```bash
# 1. Al primo setup, imposta le variabili critiche
export DATABASE_URL="postgresql://..."
export JWT_SECRET="dev-secret"
export BOOKING_UPDATE_PASSWORD="your-secure-password"

# 2. Esegui seed (carica Config dal .env in DB)
npm run db:seed

# 3. Verifica con Prisma Studio
npx prisma studio
# Vai su Config table e controlla che i parametri sono caricati

# 4. Durante development
npm run dev
# Il server carica i config dal DB automaticamente

# 5. Se cambi un parametro in produzione
# Accedi direttamente al DB (UI Prisma Studio o raw SQL)
# Il cache si invalida dopo 5 minuti oppure usa:
# configService.invalidateCache('PARAMETER_KEY')
```

### Invalidare il Cache

Se cambi un parametro direttamente nel database in produzione, il server userà il valore cache per 5 minuti. Per invalidare manualmente:

```typescript
// Nel controller/service se hai modificato il config
import { configService } from '@/services/config.service';

// Invalida un singolo parametro
configService.invalidateCache('LOG_LEVEL');

// O pulisci tutto il cache
configService.invalidateCache();
```

---

## Build & Deployment

### Build

```bash
npm run build    # compila (backend TS → dist/ | frontend → .next/)
npm start        # avvia in modalità produzione
npm run lint     # linting
```

---

## Struttura progetto

```
Demo-Nagma/
├── backend/
│   ├── src/
│   │   ├── controllers/    # gestione richieste HTTP
│   │   ├── services/       # logica di business
│   │   ├── repositories/   # accesso dati (Prisma)
│   │   ├── routes/         # endpoint e permessi
│   │   ├── middlewares/    # auth, logging, errori
│   │   └── utils/          # AppError, logger, prisma singleton
│   └── prisma/             # schema e seed
├── frontend/
│   └── src/
│       ├── app/            # pagine Next.js (App Router)
│       ├── components/     # UI riutilizzabili
│       ├── hooks/          # SWR hooks di dominio
│       ├── services/       # chiamate API
│       ├── types/          # TypeScript types
│       └── utils/          # helpers condivisi
├── docker-compose.yml      # orchestrazione completa
└── image/                  # assets e logo studio
```

---

## Variabili d'ambiente

**`backend/.env`**
```env
DATABASE_URL="postgresql://root:root123@localhost:5432/nagmadb?schema=public"
JWT_SECRET="cambia-questo-in-produzione"
PORT=3001
CORS_ORIGINS="http://localhost:3000"
```

**`frontend/.env`**
```env
NEXT_PUBLIC_PORTAL_NAME="Nagma Tattoo CRM"
NEXT_PUBLIC_PORTAL_SHORT_NAME="Nagma"
NEXT_PUBLIC_PORTAL_DESCRIPTION="Gestionale Nagma Tattoo Studio"
NEXT_PUBLIC_PORTAL_LOGIN_TAGLINE="Nagma Tattoo Studio Management"
NEXT_PUBLIC_PORTAL_LOGO="/logo.svg"
NEXT_PUBLIC_API_BASE_URL="http://localhost:3001"
```

---

## Funzionalità principali

- **Dashboard** — widget KPI, agenda del giorno, panoramica finanze
- **Clienti** — anagrafica con ricerca, export CSV/XLSX, storico appuntamenti
- **Agenda** — calendario settimanale per artista con colori, gestione prenotazioni
- **Team & Turni** — griglia settimanale turni, gestione collaboratori
- **Finanze** — entrate/uscite con categorie e report mensili
- **WhatsApp** — template con variabili `{{nome}}`, anteprima, apertura `wa.me`, storico invii
- **Form Template** — builder drag-drop per schede cliente personalizzate
