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
# Sviluppo e Produzione (root)
npm run dev                        # backend + frontend in parallelo (dev)
npm run start                      # backend + frontend in parallelo (prod)
npm run install:all                # installa dipendenze per root, backend e frontend
npm run deploy                     # aggiornamento automatico da main, installazione, migrazione e build (macOS)
./start.command                    # avvio rapido con doppio clic su macOS

# Database (PostgreSQL)
npm run db:up                      # avvia il database PostgreSQL (porta 5433)
npm run db:down                    # ferma il database PostgreSQL
npm run db:migrate                 # prisma migrate dev (backend)
npm run db:seed                    # seed base (admin, staff, config)
npm run db:seed:demo               # seed dati demo (clienti, prenotazioni, finanze)

# Verification & Test
npm run typecheck                  # verifica compilazione TypeScript su backend e frontend
npm run test                       # suite backend unit, integration e security
cd backend && npx jest test/security/ --forceExit     # OWASP security audit (21 test)
cd frontend && npx playwright test --project=chromium  # E2E happy path (10 test)
k6 run backend/test/load/scenario.k6.js               # load test (smoke + ramp + spike)
```

## Seed — Profili JSON e Dati Demo

```
prisma/
  seed.ts                    ← seed base (account, staff, config)
  seed_demo_data.ts          ← seed dati demo (clienti, prenotazioni, transazioni)
  seed-data/
    nagma.json               ← Nagma: account, staff, config, template, form, crema, clientConfig
```

- `npm run db:seed` carica `seed-data/nagma.json`.
- `npm run db:seed:demo` carica i dati di prova di clienti e prenotazioni.
- Password e dati sensibili stanno solo nel JSON, mai in env.

## Docker — Gestione Database

```
infrastructure/docker/
  docker-compose.db.yml                ← container PostgreSQL 17 (porta 5433)
root/
  docker-compose.yml                   ← include → infrastructure/docker/docker-compose.db.yml
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
    app/        # Next.js App Router (pagine pubbliche e protette)
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

## Frontend — Pattern Condivisi Aggiornati

- `DataTable` gestisce tabelle AG Grid responsive; le colonne usano `flex` e `minWidth`.
- Le azioni di riga sono configurazioni `TableAction[]` passate con `rowActions` e renderizzate da `TableActions`.
- AG Grid riceve lo stato tramite `loading`; le API imperative degli overlay non devono essere usate.
- Gli stili AG Grid globali sono caricati da `app/layout.tsx` prima dell'inizializzazione delle griglie.
- I form usano `FormInput`, `FormSelect`, `TextareaInput` e `CheckboxInput`.
- `Button` supporta correttamente `sx` come oggetto, funzione o array; le azioni standard usano i wrapper semantici.
- `ExportModal` e `common/shared/api/export.api.ts` sono l'unico flusso di esportazione frontend.
- `useDateRangeFilters` sostituisce implementazioni locali equivalenti.

## Comportamenti di Dominio Aggiornati

- Il widget “Appuntamenti oggi” mostra al massimo 5 prenotazioni `CREATO`/`CONFERMATO`, ordinate per orario.
- Un appuntamento scompare dal widget 10 minuti dopo l'orario di inizio; il controllo avviene automaticamente ogni 30 secondi.
- Lo staff usa `COLLABORATORE`/`APPRENDISTA`; create e update devono condividere lo stesso contratto Zod/Prisma.
- `StaffModal` gestisce sia creazione sia modifica e deve ricevere il membro selezionato in edit.
- L'editor dei form template preserva le nuove righe delle opzioni durante la digitazione, valida chiavi duplicate e normalizza i dati al salvataggio.

## Database — Prisma

Prisma 7.8, schema in `backend/prisma/schema.prisma` + `prisma.config.ts`.
21 modelli, 6 enum. Soft delete con `deletedAt` sui dati applicativi; storico e configurazioni seguono il proprio ciclo di vita.
`@@map` per snake_case. `onDelete` esplicito.

## Esportazione Backend

Il modulo `export` genera CSV UTF-8 BOM, Excel e PDF. I PDF usano template dedicati in `backend/src/modules/export/templates/` e utility condivise in `backend/src/modules/export/utils/pdf.utils.ts`; non inserire layout PDF specifici direttamente nei controller.

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
