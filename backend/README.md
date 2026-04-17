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

# Debug
DEBUG_HTTP=false
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

# Disattiva debug
DEBUG_HTTP=false
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
