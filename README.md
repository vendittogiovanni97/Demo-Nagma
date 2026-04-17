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

## Comandi utili

### Database (da `backend/`)

```bash
npx prisma migrate dev --name nome_modifica   # nuova migrazione
npx prisma migrate deploy                      # applica migrazioni in prod
npx prisma db push                             # sync schema senza migrazione (dev rapido)
npx prisma studio                              # UI per esplorare i dati
npm run db:seed                                # seed dati iniziali
```

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
