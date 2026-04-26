# Backend — Nagma Tattoo CRM

API REST per gestione studio tatuaggi: clienti, agenda, turni, finanze e WhatsApp.

## 🏗️ Stack Tecnologie

| Strato | Tecnologie |
|--------|-----------|
| **Runtime** | Node.js >= 24 |
| **Framework** | Express.js 5 |
| **ORM** | Prisma 7 + PostgreSQL |
| **Linguaggio** | TypeScript 6 |
| **Validation** | Zod 4.x |
| **API Docs** | Swagger/OpenAPI |
| **Database** | PostgreSQL 17 (Docker) |
| **Auth** | JWT + bcryptjs |
| **HTTP** | CORS + Helmet + Rate Limit |

---

## 📁 Struttura Progetto

```
backend/
├── src/
│   ├── controllers/          # Request handlers (HTTP endpoints)
│   │   ├── team.controller.ts
│   │   ├── customer.controller.ts
│   │   ├── booking.controller.ts
│   │   └── auth.controller.ts
│   │
│   ├── services/             # Business logic layer
│   │   ├── team.service.ts
│   │   ├── customer.service.ts
│   │   ├── booking.service.ts
│   │   └── spesa-libera.service.ts
│   │
│   ├── repositories/         # Data access layer (Prisma abstractions)
│   │   ├── BaseRepository.ts    # Generic CRUD base class
│   │   ├── StaffRepository.ts
│   │   ├── ShiftRepository.ts
│   │   ├── CustomerRepository.ts
│   │   ├── BookingRepository.ts
│   │   └── UserRepository.ts
│   │
│   ├── routes/               # Route definitions + middleware stack
│   │   ├── team.routes.ts
│   │   ├── customer.routes.ts
│   │   ├── booking.routes.ts
│   │   └── auth.routes.ts
│   │
│   ├── middlewares/          # Express middlewares
│   │   ├── auth.middleware.ts   # JWT verification
│   │   ├── error.middleware.ts  # Global error handler
│   │   └── logger.middleware.ts # Request logging
│   │
│   ├── utils/                # Helper functions
│   │   ├── AppError.ts       # Custom error class
│   │   ├── logger.ts         # Logging utility
│   │   └── jwt.ts            # JWT sign/verify
│   │
│   ├── db.ts                 # Prisma client singleton (Prisma 7)
│   ├── types.ts              # Global TypeScript types
│   └── index.ts              # Entry point
│
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── seed.ts               # Seed script for initial data
│   └── migrations/           # Migration files (generated)
│
├── prisma.config.ts          # ⭐ Prisma 7 configuration
├── .env                       # Environment variables
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── .gitignore                 # Git exclusions
└── docker-compose.yml         # PostgreSQL orchestration
```

---

## 🚀 Avvio Rapido

### 1. Prerequisiti

```bash
# Verifica Node.js
node --version  # >= v24.0.0
npm --version   # >= 11.0.0

# Verifica Docker (opzionale — per PostgreSQL)
docker --version
```

### 2. Installa dipendenze

```bash
npm install
```

### 3. Avvia PostgreSQL (Docker)

```bash
# Primo avvio — crea il container e schema
docker compose up -d

# Verifica connessione
docker compose logs -f postgres
```

### 4. Setup Database

```bash
# Genera Prisma Client
npx prisma generate

# Spinge schema al database
npx prisma db push

# Popola con dati iniziali
npm run db:seed
```

### 5. Avvia il server

```bash
npm run dev
# → http://localhost:3001
# → API Docs: http://localhost:3001/api-docs
```

---

## 📊 Architettura (Pattern Layer)

### 1️⃣ Controller Layer

**Responsabilità:**
- Riceve HTTP request da client
- Valida input (parsing, zod validation)
- Chiama il service layer
- Ritorna HTTP response (JSON + status code)

**Esempio: `team.controller.ts`**
```typescript
export async function getShifts(req: Request, res: Response) {
  try {
    const { staffId } = req.params;
    
    // Controller NON sa come i dati sono salvati nel DB
    const shifts = await teamService.getShiftsByStaff(staffId);
    
    res.json({ success: true, data: shifts });
  } catch (error) {
    next(error);
  }
}
```

### 2️⃣ Service Layer

**Responsabilità:**
- Logica di business
- Coordinate tra repository e altri service
- Validazioni complesse
- Transazioni multi-record

**Esempio: `team.service.ts`**
```typescript
export async function getShiftsByStaff(staffId: string) {
  // Business logic
  const staff = await shiftRepository.findByStaffId(staffId);
  
  if (!staff) {
    throw new AppError('Staff not found', 404);
  }
  
  // Validazione: staff attivo (non soft-deleted)
  if (staff.deletedAt !== null) {
    throw new AppError('Staff is deleted', 410);
  }
  
  return staff.shifts;
}
```

### 3️⃣ Repository Layer

**Responsabilità:**
- Accesso dati DB (abstrazione Prisma)
- CRUD operations
- Query complesse (joins, filtering, pagination)
- Soft delete logic

**Base class: `BaseRepository.ts`**
```typescript
export abstract class BaseRepository<T> {
  abstract findById(id: string | number): Promise<T | null>;
  abstract findAll(): Promise<T[]>;
  abstract create(data: CreateInput): Promise<T>;
  abstract update(id: string | number, data: UpdateInput): Promise<T>;
  abstract delete(id: string | number): Promise<void>;
  // ... soft delete, findMany, etc.
}
```

**Esempio: `ShiftRepository.ts`**
```typescript
export class ShiftRepository extends BaseRepository<Shift> {
  async findByStaffId(staffId: number) {
    return this.prisma.shift.findMany({
      where: { staffId, deletedAt: null },
      orderBy: { date: 'asc' },
    });
  }
  
  async createBulk(shifts: ShiftCreateInput[]) {
    return this.prisma.shift.createMany({ data: shifts });
  }
}
```

### 4️⃣ Prisma Layer (ORM)

**Responsabilità:**
- Query type-safe al database
- Migrazioni schema
- Client singleton con PrismaPg adapter

**File: `db.ts` (Prisma 7)**
```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: env('DATABASE_URL') });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
```

---

## 🔐 Flusso Autenticazione

```
Client HTTP Request
  ↓ [Header: Authorization: Bearer <token>]
  ↓
Middleware: auth.middleware.ts
  ↓ [Verifica token JWT]
  ↓
Controller (req.user populato)
  ↓
Service (controlla permessi con req.user.role)
  ↓
Repository (query database)
  ↓
Database
```

**JWT Secret:**
```bash
# In .env
JWT_SECRET="your-super-secret-key-change-in-production"

# In auth middleware
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = decoded; // { id, email, role }
```

---

## 🗄️ Prisma 7 — Setup Specifico

### File Configurazione

#### `prisma.config.ts` (⭐ NUOVO in Prisma 7)

```typescript
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),  // ← URL dal .env
  },
  migrations: {
    seed: "tsx prisma/seed.ts", // ← Seed script
  },
});
```

**Importante:** La URL del database NON va più in `schema.prisma`!

#### `prisma/schema.prisma` (senza URL)

```typescript
datasource db {
  provider = "postgresql"
  // URL viene da prisma.config.ts ↑
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  // ...
}
```

#### `src/db.ts` (Prisma 7 client con adapter)

```typescript
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg"; // ← Adapter PostgreSQL nativo
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
```

### Comandi Prisma 7

```bash
# Genera client TypeScript
npx prisma generate

# Spinge schema direttamente al DB (dev rapido)
npx prisma db push

# Crea migrazione (per produzione)
npx prisma migrate dev --name nome_migrazione

# Applica migrazioni in prod
npx prisma migrate deploy

# Popola DB
npm run db:seed

# Visualizza dati (UI web)
npx prisma studio

# Reset completo (⚠️ cancella tutto)
npm run db:reset
```

---

## 🛠️ Comandi npm Disponibili

```bash
npm run dev              # Avvia server con nodemon (hot reload)
npm run build            # Compila TypeScript → dist/
npm start                # Avvia in produzione (node dist/index.js)
npm run db:seed          # Esegui seed (dati iniziali)
npm run db:migrate       # Crea migrazione
npm run db:migrate:prod  # Applica migrazioni in prod
npm run db:reset         # ⚠️ Reset DB + seed
npm run db:push          # Sincronizza schema
npm run db:studio        # Apri Prisma Studio UI
npm run lint             # ESLint (opzionale)
```

---

## 🌍 Environment Variables

### `.env` (Development)

```env
# Database
DATABASE_URL="postgresql://root:root123@localhost:5432/nagmadb?schema=public"

# JWT
JWT_SECRET="dev-secret-key-change-in-production"

# Server
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGINS="http://localhost:3000"

# Configuration Parameters (caricati nel DB al seed)
# Questi parametri sono gestiti nella tabella Config — vedere sezione "Centralized Configuration"
DEBUG_HTTP=false
LOG_LEVEL=INFO
JWT_EXPIRY=8h
BCRYPT_SALT_ROUNDS=10
LOGIN_RATE_LIMIT_WINDOW_MINUTES=15
LOGIN_RATE_LIMIT_MAX_ATTEMPTS=5
SESSION_TIMEOUT_MINUTES=30
MAX_PAGE_LIMIT=100
APP_VERSION=1.0.0

# Security: password per aggiornamenti prenotazioni (DB-only, mai nel codice!)
BOOKING_UPDATE_PASSWORD="nagmatatto12"
```

### `.env.production`

```env
# Database (produzione — cloud provider)
DATABASE_URL="postgresql://prod_user:secure_pass@prod.host:5432/nagmadb"

# JWT (⚠️ Usa secret lungo e random)
JWT_SECRET="$(openssl rand -base64 32)"

# Server
PORT=3001
NODE_ENV=production

# CORS (solo frontend domain)
CORS_ORIGINS="https://tuodominio.com"

# Configuration Parameters
DEBUG_HTTP=false
LOG_LEVEL=WARN
JWT_EXPIRY=24h
BCRYPT_SALT_ROUNDS=12
LOGIN_RATE_LIMIT_WINDOW_MINUTES=10
LOGIN_RATE_LIMIT_MAX_ATTEMPTS=3
SESSION_TIMEOUT_MINUTES=60
MAX_PAGE_LIMIT=50
APP_VERSION=1.0.0

# Security: password per aggiornamenti prenotazioni (DB-only!)
BOOKING_UPDATE_PASSWORD="your-secure-password-here"
```

### 🔧 Centralized Configuration Management (Aprile 2026)

Tutti i parametri di configurazione sono ora gestiti nella tabella `Config` del database tramite `ConfigService`:

#### Come funziona

1. **Al boot:** `initializeConfig()` carica TUTTI i config dal DB in memoria
2. **Runtime:** Getter asincroni leggono da cache TTL (5 minuti)
3. **Post-boot:** Getter sincroni leggono da "critical config" per operazioni immediate

#### Parametri gestiti da ConfigService

| Parametro | Accesso | File che lo usa |
|-----------|---------|-----------------|
| `LOG_LEVEL` | Async + Sync | `src/utils/logger.ts` |
| `DEBUG_HTTP` | Sync | `src/middlewares/logger.middleware.ts` |
| `JWT_EXPIRY` | Sync | `src/controllers/auth.controller.ts` |
| `BCRYPT_SALT_ROUNDS` | Sync | `src/controllers/auth.controller.ts`, `src/services/team.service.ts` |
| `LOGIN_RATE_LIMIT_WINDOW_MINUTES` | Sync | `src/middlewares/rateLimiter.ts` |
| `LOGIN_RATE_LIMIT_MAX_ATTEMPTS` | Sync | `src/middlewares/rateLimiter.ts` |
| `SESSION_TIMEOUT_MINUTES` | Async | *(future use)* |
| `MAX_PAGE_LIMIT` | Sync | Tutti i Repository (findAllPaged) |
| `APP_VERSION` | Sync | `src/index.ts` (health endpoint) |
| `FILES_PATH` | Async | `src/services/config.service.ts` |
| `BOOKING_UPDATE_PASSWORD` | Sync | `src/services/booking.service.ts` |

#### Modello Data ConfigService

```typescript
// In configService
const CONFIG_CACHE_TTL = 5 * 60 * 1000; // 5 minuti
const configCache = new Cache<string>(CONFIG_CACHE_TTL); // cache con TTL
const criticalConfig: Record<string, string> = {}; // in-memory store

// Sequenza di lookup per getConfigValue():
// 1. Check critical config (caricato al boot)
// 2. Check cache
// 3. Query database e cache il risultato
```

#### Sicurezza: Passwords Solo nel Database

**REGOLA FONDAMENTALE:** Password e segreti vivono nel database, mai nel codice sorgente.

```typescript
// ❌ VIETATO: hardcoded default in codice
async function getBookingUpdatePasswordSync(): string {
  return getConfigValueSync('BOOKING_UPDATE_PASSWORD', 'nagmatatto12'); // NO!
}

// ✅ CORRETTO: nessun default nel codice
async function getBookingUpdatePasswordSync(): string {
  return getConfigValueSync('BOOKING_UPDATE_PASSWORD', ''); // fallback vuoto
}
```

Se la password non è configurata nel DB, l'API ritorna HTTP 503 con messaggio "Password non configurata".

#### Come usare ConfigService

**Nel controller:**
```typescript
async function updateBooking(req: Request, res: Response) {
  const saltRounds = await configService.getBcryptSaltRoundsSync(); // ✅
  const password = configService.getBookingUpdatePasswordSync(); // ✅
}
```

**Nel middleware:**
```typescript
function loggerMiddleware(req, res, next) {
  const logLevel = configService.getLogLevelSync(); // ✅ sincronistico
  const shouldLog = logLevel !== 'SILENT';
}
```

**Nel repository (pagination):**
```typescript
async findAllPaged(opts: PaginationOpts) {
  const maxLimit = configService.getMaxPageLimitSync();
  const limit = Math.min(opts.limit, maxLimit);
  // Query with limit
}
```

---

## 🗄️ Database Schema

### Modelli Principali

```prisma
model User {
  id       Int     @id @default(autoincrement())
  email    String  @unique
  password String  // bcrypt hash
  role     Role    @default(ARTIST)
  deletedAt DateTime?
}

model Staff {
  id     Int     @id @default(autoincrement())
  name   String
  type   StaffType
  color  String
  shifts Shift[]
}

model Shift {
  id        String   @id @default(cuid())
  staffId   Int
  date      DateTime
  startTime String
  endTime   String
  staff     Staff    @relation(fields: [staffId], references: [id], onDelete: Cascade)
}

model Booking {
  id         Int      @id @default(autoincrement())
  customerId Int
  artistId   Int?
  date       DateTime
  status     BookingStatus @default(CONFIRMED)
  customer   Customer @relation(fields: [customerId], references: [id])
  artist     Staff?   @relation(fields: [artistId], references: [id])
}

enum Role {
  SUPER_ADMIN
  ADMIN
  USER
  ARTIST
}
```

### Soft Delete Pattern

```typescript
// Nel schema
model User {
  id        Int      @id
  email     String
  deletedAt DateTime? // ← NULL = attivo, timestamp = eliminato
}

// Nel repository
async findActive() {
  return this.prisma.user.findMany({
    where: { deletedAt: null }
  });
}

// Soft delete
async softDelete(id: number) {
  return this.prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
}
```

---

## 🧪 Testing & Development

### Prisma Studio

```bash
# Apri UI web per visualizzare/editare dati
npx prisma studio
# → http://localhost:5555
```

### Database Reset

```bash
# ⚠️ Cancella TUTTO e ricrea
npm run db:reset

# Ricrea migrazioni da schema
npx prisma migrate dev --name init
```

### Seed Customizzato

Modifica `prisma/seed.ts`:
```typescript
async function main() {
  // Pulisci dati vecchi (opzionale)
  await prisma.user.deleteMany();
  
  // Crea dati nuovi
  const admin = await prisma.user.create({
    data: { email: 'admin@test.it', role: 'ADMIN' }
  });
  
  console.log('✅ Seed completato');
}

main().catch(e => console.error(e));
```

### Updated Services & Controllers (Aprile 2026)

Questi file ora leggono parametri da ConfigService invece di hardcoded values:

#### 🔐 Authentication & Security

**`src/controllers/auth.controller.ts`**
- `login()`, `register()`, `refresh()`, `changePassword()` 
- Usano: `configService.getJwtExpirySync()`, `configService.getBcryptSaltRoundsSync()`

**`src/services/team.service.ts`**
- `resetPassword()` 
- Usa: `configService.getBcryptSaltRoundsSync()`

**`src/middlewares/rateLimiter.ts`**
- Middleware che protegge `/auth/login`
- Usa: `configService.getLoginRateLimitWindowMinutesSync()`, `configService.getLoginRateLimitMaxAttemptsSync()`

#### 📊 Logging & Debug

**`src/utils/logger.ts`**
- Implementa LOG_LEVEL filtering
- `shouldLog()` controlla se message deve essere loggato basandosi su LOG_LEVEL_PRIORITY
- Usa: `configService.getLogLevelSync()`

Livelli supportati (in ordine):
```
DEBUG (0) → INFO (1) → WARN (2) → ERROR (3)
```

Se `LOG_LEVEL=INFO`, vengono loggati: INFO, WARN, ERROR (non DEBUG)

#### 📑 Pagination

Questi repository usano `MAX_PAGE_LIMIT` per validare il limite massimo:

**Repository files:**
- `src/repositories/booking.repository.ts`
- `src/repositories/transaction.repository.ts`
- `src/repositories/customer.repository.ts`
- `src/repositories/booking-history.repository.ts`
- `src/repositories/cream.repository.ts`
- `src/repositories/spesa-libera.repository.ts`
- `src/repositories/user.repository.ts`

**Services:**
- `src/services/spesa-libera.service.ts`
- `src/services/transaction.service.ts`

Tutti usano: `configService.getMaxPageLimitSync()`

#### 📱 Health Endpoint

**`src/index.ts`**
- Health endpoint `/health` include `appVersion` dalla ConfigService
- Usa: `configService.getAppVersionSync()`

#### 🔐 Booking Security

**`src/services/booking.service.ts`**
- `verifyPassword()` controlla la password di aggiornamento prenotazioni
- Usa: `configService.getBookingUpdatePasswordSync()`
- Ritorna HTTP 503 se password non è configurata in DB

---

## 🔍 Troubleshooting

### ❌ "Cannot find module @prisma/client"

```bash
# Soluzione: Genera client
npx prisma generate
```

### ❌ "Database connection refused"

```bash
# Verifica che PostgreSQL è in esecuzione
docker compose ps

# Riavvia Docker
docker compose down
docker compose up -d
```

### ❌ "Migration failed"

```bash
# Visualizza lo stato
npx prisma migrate status

# Risolvi migration pending
npx prisma migrate resolve --rolled-back <migration_name>

# Ricrea da zero
npm run db:reset
```

### ❌ "Prisma schema validation error"

```bash
# ❌ SBAGLIATO: URL in schema.prisma
datasource db {
  url = env("DATABASE_URL") // ← ERRORE in Prisma 7!
}

# ✅ CORRETTO: URL in prisma.config.ts
// schema.prisma
datasource db {
  provider = "postgresql"
}

// prisma.config.ts
datasource: { url: env("DATABASE_URL") }
```

### ❌ ConfigService Issues

#### Errore: "Password non configurata"
```bash
# Causa: BOOKING_UPDATE_PASSWORD non è impostata nel DB

# Soluzione 1: Imposta via environment e reseed
export BOOKING_UPDATE_PASSWORD="your-password"
npm run db:reset

# Soluzione 2: Imposta direttamente nel DB (Prisma Studio)
npx prisma studio
# Vai su Config → modifica BOOKING_UPDATE_PASSWORD value

# Soluzione 3: Verifica con SQL
psql <DATABASE_URL> -c "SELECT * FROM \"Config\" WHERE \"paramsKey\" = 'BOOKING_UPDATE_PASSWORD';"
```

#### Errore: "Config parameter not found, using default"
```bash
# Causa: Parametro non è stato seedato nel DB

# Soluzione: Esegui seed
npm run db:seed

# Verifica con Prisma Studio
npx prisma studio
# Verifica che tutti i parametri sono nella tabella Config
```

#### LOG_LEVEL non cambia durante runtime
```bash
# Causa: Cache TTL è di 5 minuti

# Soluzione 1: Attendere 5 minuti e fare un'altra richiesta

# Soluzione 2: Invalidare manualmente il cache
# Nel file dove usi logger, aggiungi:
import { configService } from '@/services/config.service';
configService.invalidateCache('LOG_LEVEL'); // invalida LOG_LEVEL
// o
configService.invalidateCache(); // invalida tutto

# Soluzione 3: Cambia e reseed
npm run db:reset
```

#### Performance: ConfigService query al DB ad ogni richiesta
```
Questo NON dovrebbe succedere perché:
1. Al boot, initializeConfig() carica TUTTI i config in memoria
2. Runtime getters leggono da cache con TTL di 5 minuti
3. Sync getters leggono da "critical config" in-memory (zero DB queries)

Se vedi molte query al DB in logging:
✓ Verifica che initializeConfig() è stato chiamato in src/index.ts
✓ Usa getters SYNC durante richieste (non async)
✓ Controlla il cache TTL setting in config.service.ts
```

---

## 🚀 Deployment

### Docker Build

```dockerfile
# Dockerfile
FROM node:24-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001
CMD ["npm", "start"]
```

### Docker Compose (Produzione)

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://...
      JWT_SECRET: ...
    depends_on:
      - postgres
  
  postgres:
    image: postgres:17
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: ...
```

### Migrazioni in Produzione

```bash
# Applica tutte le migrazioni pending
npx prisma migrate deploy

# Avvia server
npm start
```

---

## 📚 Risorse Utili

- **Prisma Docs**: https://www.prisma.io/docs
- **Prisma 7 Migration**: https://www.prisma.io/docs/orm/prisma-migrate
- **Express Best Practices**: https://expressjs.com/en/advanced/best-practice-performance.html
- **JWT Security**: https://tools.ietf.org/html/rfc7519

---

## 👤 Contribuire

1. Crea branch: `git checkout -b feature/nome-feature`
2. Commit: `git commit -m "Add: descrizione"`
3. Push: `git push origin feature/nome-feature`
4. Apri Pull Request

### Code Style

- **TypeScript strict mode**
- **Variabili camelCase**
- **Funzioni descrittive** (es. `getUserWithBookings` non `getUser`)
- **Error handling**: Usa sempre `AppError`
- **Logging**: Usa `logger.info()` non `console.log()`

---

**Ultimo aggiornamento:** 17 Aprile 2026  
**Versione:** 1.0  
**Stack:** Express 5 + Prisma 7 + PostgreSQL 17 + TypeScript 6
