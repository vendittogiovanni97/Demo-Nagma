# Nagma Tattoo CRM — Analisi Architetturale
> Generato il 2026-04-07

---

## Panoramica Tecnica

### Stack e Versioni

| Layer | Tecnologia | Versione |
|---|---|---|
| Frontend Framework | Next.js (App Router) | 16.2.1 |
| UI Library | React | 19.2.4 |
| Tipizzazione | TypeScript | 5.x (FE) / 6.0.2 (BE) |
| Data Fetching | SWR | 2.4.1 |
| Grafici | Recharts | 3.8.1 |
| Styling | Tailwind CSS | 4.x |
| Backend Framework | Express | 5.2.1 |
| ORM | Prisma | 6.4.1 |
| Database | PostgreSQL | — |
| Auth | JWT + bcryptjs | 9.0.3 / 3.0.3 |

### Struttura Cartelle

```
Demo-Nagma/
├── frontend/src/
│   ├── app/               # Route pages (App Router)
│   │   ├── page.tsx       # Dashboard
│   │   ├── login/
│   │   ├── clienti/
│   │   ├── agenda/
│   │   ├── spese/
│   │   ├── team/
│   │   └── creams/
│   ├── api/
│   │   ├── client.ts      # Generic apiFetch (Bearer token, error handling)
│   │   └── endpoints.ts   # URL constants
│   ├── components/        # 8 modal/ui components (~805 LOC)
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── services/          # 6 domain service files
│   ├── types/             # TypeScript interfaces
│   └── utils/auth.ts
│
└── backend/src/
    ├── index.ts           # Express app + route registration
    ├── controllers/       # 6 controllers
    ├── services/          # 5 business logic services
    ├── repositories/      # 6 data access layers (Prisma)
    ├── routes/            # 6 Express router files
    ├── middlewares/
    │   └── auth.middleware.ts
    └── utils/prisma.ts    # Prisma singleton
```

**Modelli Prisma (10):** User, Customer, Booking, BookingHistory, Transaction, Shift, Cream, CreamSale + enum Role / BookingStatus / TransactionType.

---

## Analisi Architetturale

### Pattern Identificati

**Frontend:**
- App Router Next.js con file-based routing
- State management: Context API (auth) + SWR (server state/caching) — nessun Redux
- Service layer uniforme che delega tutto a un singolo `apiFetch` in `frontend/src/api/client.ts`
- Modal-based CRUD per ogni dominio

**Backend:**
- Three-tier MVC: Controller → Service → Repository
- Soft-delete pattern con `deletedAt` su tutti i modelli
- JWT Bearer token (8h), nessun refresh token
- Business logic cross-domain nel Service layer:
  - booking completion → crea Transaction INCOME automaticamente
  - cream sale → decrement stock + crea Transaction INCOME

### Mismatch Frontend ↔ Backend (Types)

| Campo | Frontend | Backend | Problema |
|---|---|---|---|
| `role` | `any` / non tipizzato | `enum Role { ADMIN, USER, ARTIST }` | Nessun type safety FE |
| `status` (Booking) | `string` | `enum BookingStatus` | Accetta valori invalidi |
| `type` (Transaction) | `string` | `enum TransactionType` | Accetta valori invalidi |
| `dayOfWeek` (Shift) | `0=Lun` hardcoded | `0-6 integer` | Mapping confuso |

### API Error Format Inconsistente

| Endpoint | Error Shape |
|---|---|
| GET /api/customers | `{ status: 'error', message }` |
| GET /api/bookings | `{ error }` |
| POST /api/transactions | `{ status: 'error', message }` |

---

## Endpoint API Completi

### Auth
```
POST   /api/auth/login       → { email, password } → { token, user }
POST   /api/auth/register    → { name, email, password, role? } → { message, user }
GET    /api/auth/me          → [Authenticated] → { id, email, role, name }
```

### Customers
```
GET    /api/customers                    → Customer[]
GET    /api/customers/:id                → Customer (con bookings, creamSales)
POST   /api/customers                    → Customer
PUT    /api/customers/:id                → Customer
DELETE /api/customers/:id                → 204
```

### Bookings
```
GET    /api/bookings                     → Booking[] (filter: ?month)
GET    /api/bookings/stats               → BookingStats (filter: ?month)
POST   /api/bookings                     → Booking
PUT    /api/bookings/:id                 → Booking (se status=COMPLETED → crea Transaction INCOME)
DELETE /api/bookings/:id                 → 204
```

### Transactions
```
GET    /api/transactions                 → Transaction[] (filter: ?type, ?month)
GET    /api/transactions/summary         → { totalIncome, totalExpense, balance }
GET    /api/transactions/trends          → [{ month, income, expense }] (default: 6 mesi)
GET    /api/transactions/performance     → Artist performance metrics
POST   /api/transactions                 → Transaction
DELETE /api/transactions/:id             → 204
```

### Team
```
GET    /api/team/users                   → User[]
POST   /api/team/users                   → User
GET    /api/team/shifts                  → Shift[] (required: ?weekStart)
POST   /api/team/shifts                  → Shift
PUT    /api/team/shifts/:id              → Shift
DELETE /api/team/shifts/:id              → 204
```

### Creams / Inventory
```
GET    /api/creams                       → Cream[]
POST   /api/creams                       → Cream
PUT    /api/creams/:id                   → Cream
GET    /api/creams/sales                 → CreamSale[] (filter: ?sellerId, ?month)
POST   /api/creams/sales                 → CreamSale + Transaction INCOME
```

---

## Raccomandazioni Azionabili

### 1. Fix Transaction Isolation (Priorità ALTA)

**File:** `backend/src/services/cream.service.ts`, `backend/src/services/booking.service.ts`

Operazioni DB multiple senza atomicità → inconsistenza in caso di crash.

```typescript
// Esempio fix - cream.service.ts registerSale()
const result = await prisma.$transaction(async (tx) => {
  await tx.cream.update({ where: { id: creamId }, data: { stock: { decrement: quantity } } });
  const sale = await tx.creamSale.create({ data: { ... } });
  await tx.transaction.create({ data: { type: 'INCOME', amount: totalPrice, ... } });
  return sale;
});
```

### 2. Condividere Enum Frontend/Backend (Priorità ALTA)

**File da creare:** `frontend/src/types/enums.ts`

```typescript
export enum Role { ADMIN = 'ADMIN', USER = 'USER', ARTIST = 'ARTIST' }
export enum BookingStatus { CONFIRMED = 'CONFIRMED', CANCELLED = 'CANCELLED', COMPLETED = 'COMPLETED', RESCHEDULED = 'RESCHEDULED' }
export enum TransactionType { INCOME = 'INCOME', EXPENSE = 'EXPENSE' }
```

Aggiornare poi `frontend/src/types/customer.ts` e `frontend/src/types/dashboard.ts`.

### 3. Validazione Input + Error Format Uniforme (Priorità ALTA)

**Aggiungere `zod`** nel backend per validare payload:

```typescript
// backend/src/validators/booking.validator.ts
import { z } from 'zod';
export const CreateBookingSchema = z.object({
  customerId: z.string().uuid(),
  artistId: z.string().uuid(),
  date: z.string().datetime(),
  price: z.number().positive().optional(),
});
```

**Standardizzare error response** su:
```typescript
{ success: boolean, data?: T, error?: { code: string, message: string } }
```

---

## Refactoring Completato — 2026-04-07

| Area | Cosa | File |
|---|---|---|
| Backend | `AppError` class per errori tipizzati con status code | `src/utils/AppError.ts` |
| Backend | Zod validators centralizzati + helper `validate()` | `src/utils/validators.ts` |
| Backend | CORS con whitelist (`CORS_ORIGINS` da .env) | `src/index.ts` |
| Backend | Crash esplicito all'avvio se `JWT_SECRET` o `DATABASE_URL` mancanti | `src/index.ts` |
| Backend | Error format uniforme `{ message }` in tutti i controller | tutti i controller |
| Backend | Validazione zod in tutti i service | tutti i service |
| Backend | `prisma.$transaction()` in `registerSale` (atomicità stock + vendita + incasso) | `cream.service.ts` |
| Backend | Rimosso stub Outlook (`outlookEventId`) e `require()` dinamici | `booking.service.ts` |
| Backend | `findByEmail()` aggiunto a `UserRepository` | `user.repository.ts` |
| Backend | `auth.middleware.ts` usa `Role` enum Prisma, rimosso fallback JWT | `auth.middleware.ts` |
| Frontend | Enum condivisi `Role`, `BookingStatus`, `TransactionType` | `src/types/enums.ts` |
| Frontend | Interfacce TypeScript complete e tipizzate con enum | `src/types/dashboard.ts`, `customer.ts` |

---

## Issues Noti (Backlog)

| Priorità | Issue | File |
|---|---|---|
| ALTA | Transaction isolation mancante | cream.service.ts, booking.service.ts |
| ALTA | Nessuna validazione input (no zod/joi) | tutti i controllers |
| ALTA | Soft-delete non applicato sulle include | booking.repository.ts |
| ALTA | Booking conflict detection assente | booking.service.ts |
| ALTA | Rate limiting assente su /api/auth/login | index.ts |
| MEDIA | Enum non condivisi FE/BE | frontend/src/types/ |
| MEDIA | Error response format inconsistente | tutti i controllers |
| MEDIA | JWT in cookie non httpOnly (XSS risk) | frontend/src/utils/auth.ts |
| MEDIA | CORS aperto senza whitelist | backend/src/index.ts |
| MEDIA | JWT_SECRET fallback hardcoded | auth.middleware.ts |
| BASSA | Nessuna paginazione GET /api/customers | customer.repository.ts |
| BASSA | Outlook sync stub mai implementato | booking.service.ts |
| BASSA | formData Json in Booking mai usato | schema.prisma |
| BASSA | Test coverage: 0% | — |
| BASSA | Nessun logging strutturato | — |

---

## Domande Aperte

1. **Outlook Sync** — L'integrazione con Outlook/Google Calendar è pianificata o abbandonata? Se non a breve termine, rimuovere `outlookEventId` dallo schema.
2. **FormData dinamici** — Il campo `formData Json` in Booking era per moduli di consenso personalizzati? Chiarire per implementare o eliminare.
3. **Multi-studio** — Il sistema gestisce un solo studio o più sedi/artisti freelance? Impatta la gestione dei permessi ADMIN/USER/ARTIST.
