# Nagma Tattoo CRM

Nagma Tattoo CRM è una soluzione gestionale completa per studi di tatuaggi, progettata per gestire clienti, appuntamenti (con logica a turni), transazioni finanziarie, inventario e comunicazioni tramite WhatsApp.

## 🏗️ Architettura

Il progetto è strutturato come un monorepo:

-   [`frontend/`](./frontend): Applicazione Next.js 16 (App Router) + React 19 + Tailwind CSS 4.
-   [`backend/`](./backend): Server Express 5 + TypeScript + Prisma 6 + PostgreSQL.
-   [`schemas/`](./schemas): Schemi di validazione Zod condivisi tra frontend e backend.
-   [`docs/`](./docs): Documentazione tecnica e roadmap.

Per maggiori dettagli tecnici consultare [Architettura](./docs/architettura.md).

## 🚀 Guida Rapida (Quick Start)

### 1. Prerequisiti

-   **Node.js** (consigliato v20+ tramite `nvm`).
-   **Docker** (per il database PostgreSQL).

### 2. Configurazione Environment

Crea i file `.env` nelle rispettive cartelle partendo dagli esempi (se disponibili) o compilando i valori necessari.
*Esempio Backend `.env`:*
```env
DATABASE_URL="postgresql://root:root123@localhost:5432/nagmadb?schema=public"
JWT_SECRET="tua_secret"
PORT=3001
```

### 3. Avvio Database e Infrastruttura

Dalla root del progetto:
```bash
docker compose -f backend/docker-compose.yml up -d
```

### 4. Setup Backend (Prisma & Seed)

```bash
cd backend
npm install
npx prisma db push    # Sincronizza lo schema con il DB
npm run db:seed       # Popola il DB con dati iniziali e Admin
npm run dev           # Avvia il server in modalità sviluppo
```

### 5. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Il frontend sarà disponibile su `http://localhost:3000`.

---

## 🔑 Credenziali di Accesso Default

Dopo aver eseguito il `seed`, puoi accedere con:
- **Email:** `admin@nagma.it`
- **Password:** `admin123`

---

## 🛠️ Cheat Sheet Comandi Frequenti

### Database (nella cartella `backend`)
- `npx prisma db push`: Sincronizza lo schema senza creare migration (veloce in dev).
- `npx prisma migrate dev`: Crea e applica una nuova migration.
- `npx prisma studio`: Interfaccia grafica per esplorare i dati del DB.
- `npm run db:seed`: Esegue il popolamento dei dati.

### Docker
- `docker compose -f backend/docker-compose.yml down`: Ferma il database.
- `docker compose -f backend/docker-compose.yml up -d`: Avvia il database.

### Sviluppo
- `npm run dev`: Avvia il server (backend o frontend).
- `npm run build`: Crea la build di produzione.
