# Demo-Nagma CRM — Analisi Completa e Roadmap

> Ultimo aggiornamento: 13 Aprile 2026

---

## 1. PANORAMICA DEL PROGETTO

**Demo-Nagma** è un CRM gestionale per uno studio di tatuaggi ("Nagma Tattoo"), costruito con un'architettura **monorepo** a due applicazioni separate:

```
Demo-Nagma/
├── frontend/      → Next.js 16 (App Router) + React 19 + Tailwind 4
├── backend/       → Express 5 + TypeScript + Prisma 6 + PostgreSQL
├── schemas/       → Zod schemas condivisi tra FE e BE
└── docs/          → Documentazione

> [!TIP]
> Per la guida all'avvio e la lista dei comandi rapidi, consulta il [README principale](../README.md).
```

### Stack Tecnologico

| Layer | Tecnologia |
|---|---|
| **Frontend** | Next.js 16.2.1, React 19.2.4, TypeScript 5, Tailwind CSS 4, SWR 2.4.1 |
| **Backend** | Express 5.2.1, TypeScript 6.0.2, Prisma 6.4.1, PostgreSQL |
| **Auth** | JWT Bearer (scadenza 8h) + bcryptjs 3.0.3 |
| **Validazione** | Zod 4.3.6 (schemi condivisi in root `schemas/`) |
| **UI Lib** | Radix UI, Lucide React, Framer Motion, Recharts, react-hot-toast |
| **Export** | CSV (native), XLSX (sheetjs), PDF (window.print) |
| **Sicurezza** | Helmet, CORS, express-rate-limit |

---

## 2. ARCHITETTURA FRONTEND

### Struttura

```
frontend/src/
├── api/                  # client.ts (fetch wrapper), endpoints.ts (URL costanti)
├── app/                  # Next.js App Router
│   ├── agenda/           # page.tsx
│   ├── clienti/          # page.tsx
│   ├── creams/           # page.tsx
│   ├── login/            # page.tsx
│   ├── spese/            # page.tsx
│   ├── team/             # page.tsx
│   ├── whatsapp/         # (da verificare)
│   ├── layout.tsx        # Root layout con AuthProvider, Navbar, Toaster
│   └── page.tsx          # Dashboard principale
├── components/
│   ├── data-display/     # BentoCard, DataTable, StatCard
│   ├── feedback/         # ExportButtons, GlobalErrorBoundary, PaginationControls, Skeleton, StatePanel
│   ├── forms/            # DynamicForm, FormInput, FormSelect, FormTextarea, SubmitButton
│   ├── layout/           # Navbar, PageHeader, PageTransition
│   ├── modals/           # 10 modali (Booking, Cream, Customer, Sale, Shift, Staff, Transaction, WhatsApp)
│   └── widgets/          # dashboard/ (widget compositi per la home)
├── config/               # branding.ts (env-driven), roles.ts, whatsapp.ts
├── context/              # AuthContext.tsx (sessione, login, logout, hasRole)
├── hooks/
│   ├── domain/           # useBookings, useCreams, useCustomers, useTeam, useTransactions, useWhatsApp
│   └── useDebouncedValue.ts
│   └── useWhatsAppComposer.ts
├── schemas/              # Copia locale degli schemi Zod condivisi ⚠️ DUPLICATO
├── services/             # 7 service layer (auth, booking, cream, customer, team, transaction, whatsapp)
├── types/                # TypeScript types per ogni dominio + enums + pagination
└── utils/                # auth, cn, export, permissions, toast, validation, whatsapp
```

### Punti di forza
- ✅ **App Router** correttamente implementato con layout radice e pagine separate
- ✅ **SWR** per fetch e caching con hook di dominio dedicati
- ✅ **Service layer** separato — i servizi chiamano `apiClient`, i componenti chiamano gli hook
- ✅ **AuthContext** completo con login, logout, profile loading, helper `hasRole()`
- ✅ **Branding centralizzato** via `.env` in `config/branding.ts`
- ✅ **Permessi UI** centralizzati in `utils/permissions.ts` con mapping ruoli in `config/roles.ts`
- ✅ **Export centralizzato** (CSV, XLSX, PDF) in `utils/export.ts`
- ✅ **WhatsApp composer condiviso** — hook `useWhatsAppComposer` riusabile
- ✅ **Loading/empty/error state** standardizzati tramite `StatePanel` e `Skeleton`
- ✅ **Niente barrel `index.ts`** — import espliciti (buona pratica per tree-shaking)

### API Client
Wrapper leggero su `fetch` (`/src/api/client.ts`):
- Costruisce URL con query params
- Inietta automaticamente il token JWT Bearer
- Gestisce 401 con logout automatico
- Espone `apiClient.get/post/put/delete` con generics TypeScript

⚠️ **Nota:** `API_BASE_URL` è hardcoded a `http://localhost:3001` in `endpoints.ts`. Non è configurabile via env.

---

## 3. ARCHITETTURA BACKEND

### Pattern Controller → Service → Repository

```
backend/src/
├── app.ts                  # Composizione Express, middleware, error handling
├── index.ts                # Bootstrap, validazione env, lifecycle
├── controllers/            # 7 controllers
├── services/               # 6 services (business logic)
├── repositories/           # 7 repositories (accesso Prisma)
├── routes/                 # 7 route files con wiring permessi
├── middlewares/            # auth.middleware.ts (JWT + requireRoles + adminOnly)
├── utils/                  # AppError, async-handler, logger, prisma singleton
├── types/                  # express.d.ts (type augmentation per Request)
└── schemas/                # (da verificare se vuoto o ridondante)
```

### Bootstrap e Runtime
- ✅ Separazione `app.ts` / `index.ts` — buona pratica per testing
- ✅ Validazione env all'avvio (`JWT_SECRET`, `DATABASE_URL` obbligatori)
- ✅ Restart automatico dopo crash con delay di 10 secondi
- ✅ Graceful shutdown su SIGINT/SIGTERM
- ✅ **nodemon** in sviluppo con `--watch src --ext ts`

### Middleware Stack
1. `helmet()` — security headers
2. `cors()` — origini configurabili via `CORS_ORIGINS` env, default `http://localhost:3000`
3. `express.json({ limit: '1mb' })`
4. **Request logging middleware** — genera `requestId` UUID, log inizio/fine richiesta con durata
5. **Route handlers**
6. **Global error handler** — gestisce `AppError` e errori generici con `requestId`

### Autenticazione e Autorizzazione
- **JWT** con secret da env, scadenza 8 ore
- **Rate limiting** su `/api/auth/login`: max 5 tentativi falliti ogni 15 min per IP
- **authMiddleware** — valida token Bearer, decodifica user in `req.user`
- **requireRoles()** — middleware factory per controllo ruoli
- **adminOnly** — middleware per route riservate ad ADMIN

### Logging Strutturato
- Timestamp ISO, livello, `requestId`, contesto request
- Sanitizzazione campi sensibili (password, token, authorization, secret)
- Colori ANSI in sviluppo
- `DEBUG_HTTP=true` per log estesi (body, query, headers)

---

## 4. API ENDPOINTS

| Route | Methods | Auth | Ruoli |
|---|---|---|---|
| `/api/auth/login` | POST | Public | — |
| `/api/auth/register` | POST | Auth | ADMIN |
| `/api/auth/me` | GET | Auth | — |
| `/api/customers` | GET, POST | Auth | POST: ADMIN, USER |
| `/api/customers/:id` | GET, PUT, DELETE | Auth | ADMIN, USER |
| `/api/bookings` | GET, POST, PUT, DELETE | Auth | — |
| `/api/bookings/:id/history` | GET | Auth | — |
| `/api/transactions` | GET, POST, PUT, DELETE | Auth | — |
| `/api/transactions/summary` | GET | Auth | — |
| `/api/transactions/trends` | GET | Auth | — |
| `/api/transactions/performance` | GET | Auth | — |
| `/api/team/users` | GET, POST, PUT, DELETE | Auth | — |
| `/api/team/shifts` | GET, POST, PUT, DELETE | Auth | — |
| `/api/creams` | GET, POST, PUT, DELETE | Auth | — |
| `/api/creams/sales` | GET, POST | Auth | — |
| `/api/whatsapp-templates` | GET, POST, PUT, DELETE | Auth | — |
| `/api/whatsapp-templates/logs` | GET | Auth | — |
| `/api/whatsapp-templates/send` | POST | Auth | — |
| `/api/whatsapp-templates/:id/duplicate` | POST | Auth | — |
| `/health` | GET | Public | — |

---

## 5. DATABASE (PRISMA)

### Modelli (11 totali)

| Model | Scopo |
|---|---|
| `User` | Collaboratori con ruolo, colore calendario, soft delete |
| `Customer` | Clienti studio con contatti e note |
| `Booking` | Appuntamenti con artista, stato, tipo, prezzo, acconto, history |
| `BookingHistory` | Tracking modifiche appuntamenti |
| `Shift` | Turni settimanali per collaboratore |
| `Transaction` | Entrate/uscite finanziarie |
| `Cream` | Prodotti creme con stock |
| `CreamSale` | Vendite creme con venditore e cliente |
| `FormTemplate` | Template form dinamici (schema in base64) |
| `WhatsAppTemplate` | Template messaggi con categoria e stato attivo/disattivo |
| `WhatsAppMessageLog` | Log invii manuali WhatsApp |

### Enum
- `Role`: ADMIN, USER, ARTIST
- `BookingStatus`: CONFIRMED, CANCELLED, RESCHEDULED, COMPLETED
- `TransactionType`: INCOME, EXPENSE
- `WhatsAppMessageStatus`: MANUAL_SENT, FAILED

---

## 6. SCHEMAS CONDIVISI

Posizionati in `/schemas/`:

| File | Contenuto |
|---|---|
| `common.ts` | Enum schemas, nonEmptyString, optionalEmail |
| `customer.ts` | createCustomerSchema, updateCustomerSchema |
| `booking.ts` | createBookingSchema, updateBookingSchema |
| `transaction.ts` | createTransactionSchema |
| `cream.ts` | createCreamSchema, updateCreamSchema, registerSaleSchema |
| `user.ts` | loginSchema, registerSchema, createUserSchema, createShiftSchema, updateShiftSchema |
| `whatsapp.ts` | createWhatsAppTemplateSchema, updateWhatsAppTemplateSchema, sendWhatsAppMessageSchema, listWhatsAppLogsSchema |

⚠️ **Problema:** Il frontend ha una **copia locale** in `frontend/src/schemas/` — questo crea potenziale disallineamento.

---

## 7. STATO ATTUALE DEL PROGETTO

### ✅ Cosa è IMPLEMENTATO

1. **Autenticazione completa** — login, register (admin-only), me, JWT, rate limiting, session management frontend
2. **CRUD Clienti** — completo con permessi ruoli
3. **CRUD Appuntamenti** — con history tracking, stati, filtri per mese
4. **CRUD Transazioni** — income/expense con summary, trends, performance per artista
5. **CRUD Team** — gestione utenti con ruoli, colori, turni settimanali
6. **CRUD Creme/Prodotti** — inventory con vendite registrate
7. **WhatsApp manuale** — template con categoria, attivo/disattivo, duplicazione, invio manuale con log, composer condiviso
8. **Dashboard** — widget compositi (finanze, trend, appuntamenti, performance artisti, azioni rapide, agenda del giorno)
9. **Export** — CSV, XLSX, PDF per dati filtrati
10. **Paginazione** — backend per transactions, users, creams; frontend con PaginationControls
11. **Permessi UI** — centralizzati per ruolo con regole di visibilità
12. **Branding dinamico** — via environment variables
13. **Logging strutturato** — backend con requestId e sanitizzazione
14. **Error handling uniforme** — AppError con payload consistente
15. **Form dinamici** — componente DynamicForm con template in base64 (struttura presente)

### ⚠️ Cosa MANCA o è INCOMPLETO

1. **Nessun test** — Assenza totale di unit test, integration test, e2e test
2. **`.env` files assenti** — Nessun `.env.example` per onboarding. Il progetto non parte out-of-the-box
3. **`API_BASE_URL` hardcoded** — `http://localhost:3001` in `endpoints.ts`, non configurabile
4. **Dettaglio cliente completo** — Mancante (solo lista CRUD)
5. **Pagina WhatsApp** — La route `/whatsapp` esiste ma il `page.tsx` è da verificare
6. **FormTemplate** — Modello Prisma definito ma nessun controller/route/frontend per gestirlo
7. **Nessuna documentazione API** — Manca Swagger/OpenAPI o equivalente
8. **Nessun seed script eseguibile** — `prisma/seed.js` esiste ma non configurato in `package.json`
9. **Migrazione singola** — Solo una migration presente. Manca la migration iniziale che crea le tabelle base

---

## 8. PROBLEMI E AREE DI MIGLIORAMENTO

### Critici

| Priorità | Problema | Dettaglio |
|---|---|---|
| 🔴 ALTA | Assenza test | Zero coverage. Impossibile refactoring sicuro |
| 🔴 ALTA | `.env` mancanti | Nessun `.env.example` per onboarding |
| 🔴 ALTA | `API_BASE_URL` hardcoded | Richiede modifica codice per cambiare ambiente |
| 🔴 ALTA | Migration iniziale assente | Solo 1 migration presente — il DB non si ricostruisce da zero |
| 🔴 ALTA | Frontend `schemas/` duplicati | Copia locale rischia disallineamento con root `schemas/` |

### Importanti

| Priorità | Problema | Dettaglio |
|---|---|---|
| 🟡 MEDIA | Nessun seed configurato | `seed.js` esiste ma `package.json` non ha `prisma:seed` |
| 🟡 MEDIA | FormTemplate inutilizzato | Modello DB definito ma nessuna API/UI |
| 🟡 MEDIA | Nessun middleware validazione request | I controller chiamano `validate()` manualmente |
| 🟡 MEDIA | JWT senza refresh token | Scadenza 8h senza meccanismo di refresh |
| 🟢 BASSA | `backend/src/schemas/` | Cartella presente — verificare se vuota o ridondante |
| 🟢 BASSA | Zod v4 | Zod 4.3.6 ha breaking changes — verificare compatibilità |

### Aree di miglioramento architetturali

1. **Condivisione schemi** — Il frontend dovrebbe importare da `../../schemas/` invece di duplicarli
2. **API versioning** — Nessun versioning API (`/api/v1/...`)
3. **Soft delete** — Implementato a livello DB ma nessun middleware automatico
4. **Type safety end-to-end** — Mapping manuale tra tipi Prisma e frontend
5. **Error boundary** — `GlobalErrorBoundary` presente ma non ci sono error boundaries per route specifiche

---

## 9. 🛒 LISTA DELLA SPESA — OTTIMIZZAZIONI E NUOVE FEATURE

### 🔴 FASE 1 — Fondamenta (Priorità Alta)

| # | Task | Perché | Complessità | Stato |
|---|---|---|---|---|
| 1 | **`.env.example`** per FE e BE | Il progetto non parte out-of-the-box senza template env | 🟢 Bassa | ✅ FATTO |
| 2 | **Migration iniziale Prisma** | Solo 1 migration presente, il DB non si ricostruisce da zero | 🟡 Media | ✅ FATTO |
| 3 | **`API_BASE_URL` configurabile** | Hardcoded a `localhost:3001`, serve per staging/produzione | 🟢 Bassa | ✅ FATTO |
| 4 | **Seed script configurato e arricchito** | Esisteva `seed.js` ora configurato in package.json con dati realistici | 🟢 Bassa | ✅ FATTO |
| 5 | **Eliminare schemas duplicati** | Frontend ha copia locale di Zod schemas → rischio disallineamento | 🟡 Media | ⏳ Da fare |

### 🟡 FASE 2 — Stabilità (Priorità Media)

| # | Task | Perché | Complessità | Stato |
|---|---|---|---|---|
| 6 | **Test suite** (unit + integration) | Zero coverage, impossibile refactoring sicuro | 🔴 Alta | ⏳ Da fare |
| 7 | **JWT Refresh Token** | Scadenza 8h senza refresh → utente costretto a re-login | 🟡 Media | ⏳ Da fare |
| 8 | **Pagina dettaglio Cliente** | Mancante (solo lista CRUD) | 🟡 Media | ✅ FATTO |
| 9 | **API Documentation** (Swagger/OpenAPI) | Nessuna doc API per developer onboarding | 🟡 Media | ✅ FATTO |
| 10 | **FormTemplate UI** | Modello DB definito ma nessuna API/UI per gestirlo | 🟡 Media |
| 11 | **API Versioning** (`/api/v1/...`) | Best practice per evoluzione API | 🟢 Bassa |
| 12 | **Soft delete middleware automatico** | Implementato a livello DB ma gestito manualmente in ogni repo | 🟡 Media |

### 🟢 FASE 3 — Feature Nuove (Nice to Have)

| # | Feature | Descrizione | Complessità |
|---|---|---|---|
| 13 | **Dashboard avanzata** | Filtri per data, artista, tipo servizio | 🟡 Media |
| 14 | **Notifiche push/email** | Reminder appuntamenti, alert stock creme | 🔴 Alta |
| 15 | **Calendario drag & drop** | Gestione appuntamenti visuale tipo Google Calendar | 🔴 Alta |
| 16 | **Reportistica avanzata** | Export personalizzabili, grafici comparativi | 🟡 Media |
| 17 | **Gestione inventario avanzata** | Soglie minime, ordini automatici, storico fornitori | 🟡 Media |
| 18 | **Portfolio tatuaggi** | Galleria foto per cliente/artista | 🟢 Bassa |
| 19 | **Dark mode** | Toggle tema chiaro/scuro | 🟢 Bassa |
| 20 | **Multi-studio** | Supporto per più sedi | 🔴 Alta |
| 21 | **Integrazione WhatsApp Business API** | Attualmente invio manuale, automatizzabile | 🔴 Alta |
| 22 | **Sistema di tagging clienti** | Categorizzazione clienti (es. "allergico", "fedele") | 🟢 Bassa |
| 23 | **Depositi/acconti tracking** | Gestione avanzata pagamenti parziali | 🟡 Media |
| 24 | **Audit log completo** | Tracciamento tutte le modifiche utenti | 🟡 Media |

### 🐛 FASE 4 — Bug e Tecnico

| # | Task | Perché |
|---|---|---|
| 25 | **Verificare Zod v4 compatibilità** | Zod 4.3.6 ha breaking changes |
| 26 | **Verificare pagina `/whatsapp`** | Esiste route ma page.tsx incerto |
| 27 | **Cartella `backend/src/schemas/`** | Verificare se vuota o ridondante |
| 28 | **Type safety end-to-end** | Mapping manuale tra tipi Prisma e frontend |

---

## 10. ROADMAP RACCOMANDATA

### Fase 1 — Fondamenta (1-2 giorni)
1. `.env.example` FE + BE
2. `API_BASE_URL` configurabile
3. Seed script funzionante

### Fase 2 — Stabilità (2-3 giorni)
4. Migration iniziale Prisma
5. Eliminare schemas duplicati
6. API Versioning

### Fase 3 — Qualità (3-5 giorni)
7. Test suite base (auth, CRUD critici)
8. JWT Refresh Token
9. API Documentation

### Fase 4 — Feature (opzionale)
10. Dettaglio cliente
11. Dark mode
12. Portfolio tatuaggi

---

## 11. FILE CHIAVE DI RIFERIMENTO

| File | Percorso |
|---|---|
| Frontend package.json | `frontend/package.json` |
| Frontend layout | `frontend/src/app/layout.tsx` |
| Frontend dashboard | `frontend/src/app/page.tsx` |
| Frontend API client | `frontend/src/api/client.ts` |
| Frontend API endpoints | `frontend/src/api/endpoints.ts` |
| Frontend AuthContext | `frontend/src/context/AuthContext.tsx` |
| Frontend branding config | `frontend/src/config/branding.ts` |
| Frontend roles config | `frontend/src/config/roles.ts` |
| Frontend permissions | `frontend/src/utils/permissions.ts` |
| Frontend export util | `frontend/src/utils/export.ts` |
| Frontend WhatsApp composer | `frontend/src/hooks/useWhatsAppComposer.ts` |
| Backend package.json | `backend/package.json` |
| Backend app.ts | `backend/src/app.ts` |
| Backend index.ts | `backend/src/index.ts` |
| Backend auth middleware | `backend/src/middlewares/auth.middleware.ts` |
| Backend auth controller | `backend/src/controllers/auth.controller.ts` |
| Backend logger | `backend/src/utils/logger.ts` |
| Backend AppError | `backend/src/utils/AppError.ts` |
| Prisma schema | `backend/prisma/schema.prisma` |
| Shared schemas index | `schemas/index.ts` |
| Shared common schema | `schemas/common.ts` |

---

## 12. CONCLUSIONE

Il progetto è in uno **stato avanzato di sviluppo** con un'architettura solida e ben organizzata. I pattern (Controller-Service-Repository, service layer, hook di dominio, shared schemas) sono implementati correttamente. La separazione delle responsabilità è chiara.

**Le priorità assolute** per portare il progetto a produzione sono:
1. Creare `.env.example` per entrambi i progetti
2. Aggiungere la migration iniziale o un seed funzionante
3. Eliminare la duplicazione degli schemas frontend
4. Rendere `API_BASE_URL` configurabile via env
5. Aggiungere test almeno per la business logic critica (auth, payments, WhatsApp)
