# CLAUDE.md — Demo Nagma (Tattoo CRM)

## Regole Tecniche Dettagliate (Rules)
Le regole tecniche complete sono nei file modulari:
- @.claude/rules/backend-patterns.md — Clean Architecture, DI container, use case, ownership
- @.claude/rules/database.md — migration workflow, mai prisma db push, seed
- @.claude/rules/code-style.md — loading/error state, commenti, TypeScript
- @.claude/rules/ui-components.md — componenti UI, modali, form, colori

## Regole Assolute — Seguire SEMPRE

1. **Rispondi in italiano** — sempre, qualunque lingua usi l'utente.
2. **Nessun colore hardcoded** — usa sempre `theme.palette.*` o token del tema. Mai `#hex`, `rgba(...)`, `'red'` inline nell'`sx`.
3. **Loading e Error via toast/provider** — mai `useState` sparsi per loading/errore API. Usa `useToast()` per feedback globali.
4. **Mai `prisma db push`** — solo Prisma Migrations (`prisma migrate dev`).
5. **Mai committare .env** — solo `.env.example` nel repo.
6. **Un solo httpClient** — usa sempre `apiClient` da `@/shared/api/client`. Mai `httpClient` direttamente.

## Lingua
Rispondi **sempre in italiano**, indipendentemente dalla lingua usata dall'utente.

## Stack

| Layer | Tech |
|-------|------|
| `backend/` | Express 5, Prisma 6, PostgreSQL 17, Zod 4, JWT/bcrypt, PDFKit |
| `frontend/` | Next.js 16 App Router, React 19, MUI 9, SWR, Recharts, AG Grid, FullCalendar |
| `landing-page/` | HTML/CSS/JS statico (sito marketing, non parte del CRM) |

NPM (non monorepo). Backend porta 3001, Frontend porta 3000.

## Struttura chiave

```
backend/
  src/
    config/       # env.ts, swagger.ts
    container/    # DI container manuale (index.ts)
    middlewares/  # auth, error, rateLimiter
    shared/       # errors/AppError, kernel/, utils/ (prisma, logger, validation, cache, etc.)
    modules/
      auth/         # login, register, me, refresh (Clean Architecture)
      customer/     # anagrafica clienti
      booking/      # prenotazioni + history + artisti disponibili
      staff/        # collaboratori + turni
      finance/      # transazioni + spese libere + trend + performance
      form-template/# template form dinamici
      whatsapp/     # template messaggi + invio manuale + log
      cream/        # vendita creme (⚠️ struttura flat, non Clean Architecture)
      attachment/   # upload/download file
      config/       # configurazione di sistema (key-value da DB)
      newfeature/
        consenso/       # consenso digitale tattoo (accesso pubblico)
        posizionamento/ # mappa corpo per posizionamento tattoo
    routes.ts     # monta tutte le route sotto /api
    app.ts        # Express app factory
    index.ts      # entry point con lifecycle
frontend/
  src/
    app/          # Next.js App Router (17 route)
    components/   # auth/, common/, data-display/, feedback/, forms/, layout/, modals/, providers/, ui/
    config/       # branding, design-tokens, env, nav-links, roles, status-config
    context/      # AuthContext, ThemeContext (breakpoint)
    hooks/        # useBreakpoint, useDebouncedValue, useDeleteConfirm, useFormModal, useToast, domain/
    modules/      # agenda, auth, booking, customer, staff, finance, creams, spese, form-templates,
                  #   whatsapp, dashboard, booking-history, superadmin, newfeature/{consenso,posizionamento}
    shared/       # api/ (client, endpoints), schemas/, services/, types/, utils/
    theme/        # MUI theme dark (theme.ts)
landing-page/     # sito marketing statico (HTML/CSS/JS)
```

## Comandi

```bash
# Sviluppo
cd backend && npm run dev          # nodemon (porta 3001)
cd frontend && npm run dev         # Next.js dev (porta 3000)

# Build
cd backend && npm run build        # compila TypeScript
cd frontend && npm run build       # build Next.js standalone

# Database
cd backend && npm run db:migrate   # crea + applica migration (prisma migrate dev)
cd backend && npm run db:migrate:prod  # applica in prod (prisma migrate deploy)
cd backend && npm run db:seed      # seed idempotente
cd backend && npm run db:studio    # Prisma Studio (GUI)
cd backend && npm run db:reset     # ATTENZIONE: reset completo + re-seed

# Docker
docker compose up -d               # avvia stack completo (postgres + backend + frontend)
docker compose down                 # ferma tutto
```

## Architettura Backend — Clean Architecture

Ogni modulo (tranne `cream`) segue questa struttura:
```
modules/{nome}/
  contracts/       # interfacce repository + DTO
  application/     # use case (una classe per operazione)
  infrastructure/  # repository Prisma
  domain/          # entità di dominio
  interfaces/      # controller, routes, schema Zod
```

Il DI container (`src/container/index.ts`) istanzia manualmente repository → use case → controller.

## Ruoli e Autenticazione

4 ruoli: `SUPER_ADMIN`, `ADMIN`, `USER`, `ARTIST`.
JWT in cookie (`nagma_auth_token`), refresh automatico su 401.

| Ruolo | Accesso |
|-------|---------|
| SUPER_ADMIN | tutto + admin panel |
| ADMIN | tutto tranne admin panel |
| USER | prenotazioni, clienti, agenda, staff, spese |
| ARTIST | prenotazioni proprie, agenda |

## Frontend — Data Fetching

**Un solo client**: `apiClient` da `@/shared/api/client.ts`.
- `apiClient.get/post/put/patch/delete` per chiamate dirette.
- `createCrudService<T>(basePath, byIdPath)` per CRUD standard.
- Axios solo per upload file multipart (`useAttachments`).

## Database — Schema Prisma

15 modelli, 5 enum. Schema singolo in `backend/prisma/schema.prisma`.
Soft delete con `deletedAt` su: User, Staff, Customer, Booking, Transaction.

## Variabili d'ambiente

**Backend** (`.env`):
```
DATABASE_URL, JWT_SECRET (≥32 char), PORT=3001, NODE_ENV
CORS_ORIGINS, DEBUG_HTTP, BOOKING_UPDATE_PASSWORD
ADMIN_PASSWORD, SUPER_ADMIN_PASSWORD, LOG_LEVEL
```

**Frontend** (`.env`):
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_PORTAL_NAME, NEXT_PUBLIC_PORTAL_SHORT_NAME
NEXT_PUBLIC_PORTAL_LOGO, NEXT_PUBLIC_PORTAL_DESCRIPTION
```
