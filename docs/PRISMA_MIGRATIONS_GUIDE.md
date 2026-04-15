# Prisma & Migrations Guide

## Panoramazione Configurazione Aggiornata

### Database
- **PostgreSQL 16** (Alpine) via Docker
- Container: `nagma-db`
- Porta: `5432`
- Database: `nagmadb`
- User: `root` / Password: `root123`
- Volume persistente: `nagma_data`

### Prisma Versioni (Allineate)
- `@prisma/client`: **^7.7.0**
- `@prisma/adapter-pg`: **^7.7.0**
- `prisma` (CLI): **^7.7.0**

### Modelli (10 totali)

| Modello | Descrizione |
|---|---|
| `User` | Utenti sistema (SUPER_ADMIN, ADMIN, USER, ARTIST) con soft delete, collegato a turni e log WhatsApp |
| `Staff` | Entità separata per tatuatori/piercer con tipo e colore, collegato ai booking |
| `Customer` | Anagrafica clienti con soft delete, collegato a booking e log WhatsApp |
| `Booking` | Appuntamenti collegati a Customer e Staff opzionale; ha status enum, Outlook sync ID, dati form base64, e storico |
| `BookingHistory` | Audit log per azioni booking (CREATED, RESCHEDULED, CANCELLED) |
| `Shift` | Turni settimanali per User (giorno, orario, etichetta, flag isOff) |
| `Transaction` | Registrazioni finanziarie (INCOME/EXPENSE) con categoria, soft delete |
| `FormTemplate` | Template form dinamici in base64 |
| `WhatsAppTemplate` | Template messaggi con variabili |
| `WhatsAppMessageLog` | Log messaggi WhatsApp inviati |

### Enums
- `Role`: SUPER_ADMIN, ADMIN, USER, ARTIST
- `BookingStatus`: CONFIRMED, CANCELLED, RESCHEDULED, COMPLETED
- `TransactionType`: INCOME, EXPENSE
- `WhatsAppMessageStatus`: MANUAL_SENT, FAILED

### Pattern Notevoli
- **Soft delete** (`deletedAt`) usato su: User, Customer, Booking, Shift, Transaction

---

## Storico Migrazioni

### Migrazione Attuale (Pulita)

| # | Nome | Data | Descrizione |
|---|---|---|---|
| 1 | `init_schema` | 2026-04-15 09:00 | Schema iniziale completo con tutti i modelli |

---

## File di Configurazione Prisma 7

### `prisma.config.ts` (Nuovo in Prisma 7)

```typescript
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    provider: "postgresql",
    url: process.env.DATABASE_URL || "postgresql://root:root123@localhost:5432/nagmadb?schema=public",
  },
});
```

### `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}
```

**Nota:** In Prisma 7, il `url` non è più definito nello schema ma nel `prisma.config.ts`.

---

## Script NPM Disponibili

| Script | Comando | Descrizione |
|---|---|---|
| `db:migrate` | `prisma migrate dev` | Crea e applica migrazione in sviluppo |
| `db:reset` | `prisma migrate reset --force` | Reset completo del database |
| `db:studio` | `prisma studio` | Apre Prisma Studio nel browser |
| `db:seed` | `node prisma/seed.js` | Esegue il seed del database |

---

## Workflow e Best Practices

### Sviluppo Locale

```bash
# 1. Modificare lo schema (prisma/schema.prisma)

# 2. Creare e applicare la migrazione
npx prisma migrate dev --name <descrittivo_modifica>

# 3. Rigenerare il client Prisma (se necessario)
npx prisma generate

# 4. Reset completo del DB (ATTENZIONE: perde tutti i dati!)
npx prisma migrate reset --force

# 5. Popolare il database con dati di test
npm run db:seed

# 6. Aprire Prisma Studio per visualizzare/modificare i dati
npm run db:studio
```

### Produzione

```bash
# Applicare le migrazioni pending (NON usare migrate dev!)
npx prisma migrate deploy

# Generare il client (dopo il deploy)
npx prisma generate
```

### Differenze tra i Comandi

| Comando | Ambiente | Crea Migrazioni? | Applica? | Reset? |
|---|---|---|---|---|
| `prisma migrate dev` | Sviluppo | Sì | Sì | Opzionale |
| `prisma migrate deploy` | Produzione | No | Sì | No |
| `prisma db push` | Sviluppo/Test | No | Sì (diretto) | No |
| `prisma migrate reset` | Sviluppo | No | No | Sì |

### Quando Usare Cosa

- **`prisma migrate dev`**: Usare in sviluppo per ogni modifica allo schema. Crea file di migrazione numerato, lo applica, e rigenera il client.
- **`prisma migrate deploy`**: Usare in produzione/CI. Applica solo le migrazioni pending senza creare nuovi file.
- **`prisma db push`**: Usare solo per prototipi rapidi o ambienti temporanei. Non crea file di migrazione, quindi non versionabile.
- **`prisma migrate reset`**: Usare quando lo schema è troppo divergente e si vuole ripartire da zero (solo in sviluppo).

---

## Configurazione Client Prisma 7

In Prisma 7, il client richiede un adapter esplicito per la connessione al database.

### File: `src/utils/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://root:root123@localhost:5432/nagmadb?schema=public';

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export default prisma;
```

### Seed Script: `prisma/seed.js`

```javascript
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://root:root123@localhost:5432/nagmadb?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });
```

---

## Regole d'Oro

1. **Mai** modificare manualmente le migrazioni già applicate
2. **Sempre** usare nomi descrittivi per le migrazioni
3. **Sempre** testare le migrazioni in locale prima del deploy
4. **Mai** usare `migrate dev` in produzione
5. **Sempre** versionare le migrazioni nel repository git
6. **Sempre** fare backup prima di migrazioni in produzione
7. **Sempre** allineare `@prisma/client` e `prisma` CLI alla stessa versione
8. **Sempre** passare l'adapter al `PrismaClient` in Prisma 7

---

## Risoluzione Problemi Comuni

### "Migration already applied"
```bash
# Se la migrazione è già nel DB ma non nel progetto
npx prisma migrate resolve --applied <migration_name>
```

### "Pending migrations"
```bash
# Controllare migrazioni pending
npx prisma migrate status

# Applicarle
npx prisma migrate deploy
```

### "Database is out of sync"
```bash
# Per sviluppo: resettare tutto
npx prisma migrate reset --force
npm run db:seed

# Per produzione: creare migrazione correttiva
npx prisma migrate dev --name fix_<problem>
```

### "Foreign Key Constraint Failed"
```bash
# Visualizzare i dati in Prisma Studio
npm run db:studio

# Eseguire query per verificare i dati
npx prisma db execute --stdin < script.sql
```

### "PrismaClient needs to be constructed with options" (Prisma 7)
```bash
# Assicurarsi di passare l'adapter al costruttore
const adapter = new PrismaPg(new Pool({ connectionString }));
const prisma = new PrismaClient({ adapter });
```

---

## Struttura File

| File | Percorso |
|---|---|
| Prisma Config | `backend/prisma.config.ts` |
| Prisma Schema | `backend/prisma/schema.prisma` |
| Docker Compose | `backend/docker-compose.yml` |
| Seed Script | `backend/prisma/seed.js` |
| Package.json | `backend/package.json` |
| Env Example | `backend/_env.example` |
| Prisma Client Setup | `backend/src/utils/prisma.ts` |
| Migration Lock | `backend/prisma/migrations/migration_lock.toml` |
