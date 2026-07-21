# CLAUDE.md — Demo Nagma (Tattoo CRM)

## .claude/
Regole, comandi, hook e skill in `.claude/`:
- `.claude/rules/` — regole tecniche (backend-patterns, database, code-style, ui-components)
- `.claude/commands/` — comandi custom (audit, deploy-check, migra, nuovo-modulo, review-modulo)
- `.claude/hooks/` — hook pre/post bash e post-edit
- `.claude/skills/` — skill per task specifici
- `.claude/settings.json` — configurazione Claude

## Regole Assolute — Seguire SEMPRE

1. **Rispondi in italiano** — sempre.
2. **Nessun colore hardcoded** — usa `theme.palette.*` o token del tema. Mai `#hex`, `rgba()`, `'red'` inline in `sx`.
3. **Loading e Error via toast/provider** — mai `useState` sparsi per loading/errore API. Usa `useToast()`.
4. **Mai `prisma db push`** — solo Prisma Migrations (`prisma migrate dev`).
5. **Mai committare .env** — i `.env` sono in `.gitignore`. Ogni cartella ha `.env` (dev) e `.env.production` (prod).
6. **Un solo httpClient** — usa `apiClient` da `@/common/shared/api/client`.
7. **Handler factory obbligatorio** — `handleSearch`, `handleGetById`, `handleCreate`, `handleUpdate`, `handleDelete` da `core/utils/handler.ts`. Mai try/catch nei controller.
8. **Dati seed solo in JSON** — `prisma/seed-data/<profilo>.json`. Mai dati hardcoded in `seed.ts`.
9. **Password solo nei JSON di seed** — mai in env o compose.

## Stack

| Layer | Tech |
|-------|------|
| `backend/` | Express 5, Prisma 7.8, PostgreSQL 17, Zod 4, JWT/bcrypt, PDFKit |
| `frontend/` | Next.js 16 App Router, React 19, MUI 9, SWR, Recharts, AG Grid, FullCalendar |
| `landing-page/` | HTML/CSS/JS statico |

NPM separati (no monorepo). Backend porta 3001, Frontend porta 3000.

## Variabili d'ambiente

Ogni cartella ha i suoi `.env`:

**backend/**: `.env` (dev), `.env.production`
```
DATABASE_URL, JWT_SECRET (≥32 char), PORT=3001, NODE_ENV
CORS_ORIGINS, DEBUG_HTTP, LOG_LEVEL, SEED_PROFILE
INIT_CONFIG_FROM_DB, INIT_CONFIG_SEED
```

**frontend/**: `.env` (dev), `.env.production`
```
NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_PORTAL_NAME
NEXT_PUBLIC_PORTAL_SHORT_NAME, NEXT_PUBLIC_PORTAL_LOGO
NEXT_PUBLIC_PORTAL_DESCRIPTION
```

## Comandi

```bash
# Sviluppo (root)
npm run dev                        # backend + frontend in parallelo
docker compose up -d               # stack completo Docker
docker compose -f infrastructure/docker/docker-compose.db.yml up -d   # solo DB

# Sviluppo (individuale)
cd backend && npm run dev          # nodemon (porta 3001)
cd frontend && npm run dev         # Next.js dev (porta 3000)

# Build
cd backend && npm run build
cd frontend && npm run build

# Database
cd backend && npm run db:migrate   # prisma migrate dev
cd backend && npm run db:migrate:prod  # prisma migrate deploy
cd backend && npm run db:seed      # seed (idempotente)
cd backend && npm run db:reset     # ATTENZIONE: reset completo + re-seed
SEED_PROFILE=nagma cd backend && npx prisma db seed   # seed con profilo

# Test
cd backend && npx jest --forceExit                    # 13 suite, 130+ test
cd backend && npx jest test/security/ --forceExit     # OWASP security audit (21 test)
cd frontend && npx jest                                # hook + unit test
cd frontend && npx playwright test --project=chromium  # E2E happy path (10 test)
k6 run backend/test/load/scenario.k6.js               # load test (smoke + ramp + spike)

# Docker
docker compose up -d               # avvia tutto
docker compose down                # ferma tutto
docker compose -f docker-compose.prod.yml up -d   # produzione
```

## Seed — Profili JSON

```
prisma/
  seed.ts                    ← logica pura (legge JSON, loop, upsert)
  seed-data/
    nagma.json               ← Nagma: account, staff, config, template, form, crema, clientConfig
```

`SEED_PROFILE=nagma npm run db:seed` carica `seed-data/nagma.json`.
Per aggiungere un cliente: copi JSON, cambi dati, `SEED_PROFILE=xyz npm run db:seed`.
Password e dati sensibili stanno solo nel JSON, mai in env.

## Docker — Dockerfile e compose separati

```
backend/Dockerfile                     ← Dockerfile backend
frontend/Dockerfile                    ← Dockerfile frontend
infrastructure/docker/
  docker-compose.db.yml                ← solo postgres
  docker-compose.backend.yml           ← backend + include db
  docker-compose.frontend.yml          ← frontend + include backend
  docker-compose.prod.db/backend/frontend.yml
  docker-entrypoint.sh
root/
  docker-compose.yml                   ← include → frontend.yml
  docker-compose.prod.yml              ← include → prod.frontend.yml
```

## Struttura chiave

```
backend/
  src/
    core/
      config/, container/, database/, middleware/, shared/, utils/
    modules/
      auth, customer, booking, staff, finance, form-template,
      whatsapp, cream, attachment, config, reports
    routes.ts, app.ts, index.ts
  test/         # unit test (Jest)
  prisma/       # schema, migrations, seed, seed-data/
frontend/
  src/
    app/        # Next.js App Router (17 route)
    common/     # components, config, context, hooks, shared, theme
    modules/    # agenda, auth, booking, customer, staff, finance, ...
  test/
landing-page/   # sito marketing statico
```

## Architettura Backend

Ogni modulo: `controllers/`, `services/`, `routes/`, `{nome}.bootstrap.ts`.
DI container in `core/container/`, handler factory in `core/utils/handler.ts`.

## Ruoli e Autenticazione

4 ruoli: `SUPER_ADMIN`, `ADMIN`, `USER`, `ARTIST`.
JWT via Bearer token in header `Authorization`. Refresh automatico su 401.

## Frontend — Data Fetching

Un solo client: `apiClient` da `@/common/shared/api/client.ts`.
`createCrudService<T>(basePath, byIdPath)` per CRUD standard.
Axios solo per upload multipart (`useAttachments`).

## Database — Prisma

Prisma 7.8, schema in `backend/prisma/schema.prisma` + `prisma.config.ts`.
17 modelli, 5 enum. Soft delete con `deletedAt` su tutti tranne audit log.
`@@map` per snake_case. `onDelete` esplicito.

## Master Prompt & Feature Guidelines

Demo-Nagma is a showcase application demonstrating modern web architecture with 20+ feature modules, complex routing, and real-time data management.

### Architectural Principles
1. **Feature-Driven:** Each module is independent with clear boundaries.
2. **Scalability:** Modules require clean organization, no circular dependencies.
3. **Routing:** Nested routes, lazy loading, breadcrumb navigation.
4. **Data Management:** PostgreSQL with Prisma / Mongoose for structure.
5. **UI Consistency:** MUI as design system, AG-Grid for data tables.

### Patterns for Scale
1. **Module Scaffolding:** Each feature follows identical patterns for predictability.
2. **Shared Context:** Global state for auth, settings, notifications.
3. **API Client:** Centralized API calls with error handling via `apiClient`.
4. **Caching:** SWR / React Query for server state, local storage for client state.

### Checklist for Every New Feature
- [ ] Backend: router, controller, service, types, bootstrap.
- [ ] Schema with proper indexing and soft delete.
- [ ] Frontend: page, components, API client, hooks.
- [ ] Error handling + user feedback (toast).
- [ ] Unit + integration tests.
- [ ] Mobile-responsive UI with MUI components.
- [ ] Documentation.

