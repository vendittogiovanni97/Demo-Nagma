# Nagma Backend

Server Express.js per il CRM Nagma Tattoo, con integrazione Prisma per PostgreSQL.

## Stack Tecnologico

- **Node.js:** 24 LTS
- **npm:** 11+
- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js 5
- **ORM:** Prisma 7
- **Database:** PostgreSQL 17 (via Docker)
- **Security:** JWT, Bcryptjs, Helmet, CORS, Rate Limit
- **Logging:** Strutturato con `requestId` e supporto `DEBUG_HTTP`

## Configurazione

1. Assicurati di avere un file `.env` configurato:
   ```env
   DATABASE_URL="postgresql://root:root123@localhost:5432/nagmadb?schema=public"
   JWT_SECRET="tua_secret"
   PORT=3001
   CORS_ORIGINS="http://localhost:3000"
   ```

2. Installa le dipendenze:
   ```bash
   npm install
   ```

## Gestione Database (Prisma)

### Avvio Postgres (Docker)
```bash
docker compose up -d
```

### Inizializzazione Schema
Se il database è nuovo o è stato resettato, usa:
```bash
npx prisma db push
```
Questo comando sincronizza direttamente lo schema `prisma/schema.prisma` con il database senza passare per i file di migrazione storici.

### Popolamento (Seed)
Per inserire l'Admin iniziale e i template di sistema:
```bash
npm run db:seed
```
*Credenziali Admin: `admin@nagma.it` / `admin123`*

### Migrazioni (Sviluppo avanzato)
Per creare una versione numerata delle modifiche allo schema:
```bash
npx prisma migrate dev --name nome_modifica
```

### Prisma Studio
Per visualizzare e modificare i dati via browser:
```bash
npx prisma studio
```

## Esecuzione

### Sviluppo
```bash
npm run dev
```

### Produzione
```bash
npm run build
npm start
```

## Struttura Progetto

- `src/controllers`: Gestione delle richieste HTTP.
- `src/services`: Logica di business.
- `src/repositories`: Accesso ai dati tramite Prisma.
- `src/routes`: Definizione degli endpoint e permessi.
- `src/middlewares`: Autenticazione, logging e gestione errori.
- `src/utils`: Utility globali (AppError, logger, prisma singleton).
- `prisma/`: Schema del database e script di seed.
