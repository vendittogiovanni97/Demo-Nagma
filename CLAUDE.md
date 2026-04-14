# Nagma CRM — Tattoo Studio Management

## Context & Session Management

**REGOLA CRITICA — seguire SEMPRE:**

1. **Stop al 95% contesto**: Quando il contesto si avvicina al limite (~95%), FERMATI immediatamente. Non iniziare nuove operazioni. Comunica all'utente:
   - Cosa è stato completato
   - Cosa resta da fare (lista precisa con file e dettagli)
   - Un prompt copia-incolla per riprendere nella prossima sessione

2. **Valutazione preventiva dei task grandi**: Prima di iniziare un task che richiede molte modifiche (>10 file, refactor, feature nuove), valuta se c'è abbastanza contesto rimasto per completarlo. Se il contesto è già sopra il 60%, chiedi all'utente: "Questo task è grande, rischio di non finirlo. Vuoi che lo inizi ora o preferisci una sessione nuova?"

3. **Mai lasciare a metà**: Se un task è già in corso e il contesto sta finendo, completa almeno l'unità logica corrente (es. finisci il file che stai editando, fai passare tsc) prima di fermarti. Non lasciare mai il codice in stato broken.

## Build & Type Safety

This is a TypeScript project. Always ensure `tsc --noEmit` passes before considering any task complete. Do not introduce type errors.

## Code Organization

When restructuring files or folders, keep a flat directory structure unless explicitly asked otherwise. Do not create subdirectories like ui/, modals/, etc. without confirmation.

## Troubleshooting

When encountering module resolution or path issues, prefer duplicating/copying files over symlinks or aliases. Ask the user before spending more than one attempt on path resolution.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind 4, SWR, Recharts |
| Backend | Express 5, TypeScript, Prisma 6, PostgreSQL |
| Auth | JWT (jsonwebtoken), bcryptjs, js-cookie |
| Infra | Docker Compose (PostgreSQL) |

## Structure

```
backend/
  src/
    controllers/   # Route handlers
    services/      # Business logic
    repositories/  # Prisma queries
    schemas/       # Zod validation
    middlewares/    # Auth, error handler, rate limit
    routes/        # Express routers
    config/        # Env, DB config
    types/         # Shared TS types
    utils/         # Logger, helpers
  prisma/          # Schema, migrations, seed.js

frontend/
  src/app/         # Next.js App Router pages
    agenda/        # Bookings + calendar
    clienti/       # Customers CRUD
    creams/        # Inventory + sales
    spese/         # Income/expense transactions
    team/          # Staff + weekly shifts
    whatsapp/      # WhatsApp logs
    login/         # Auth page
```

## Commands

```bash
# Backend
cd backend && npm run dev          # Dev server (nodemon + ts-node)
npm run build                      # tsc
npm run db:migrate                 # prisma migrate dev
npm run db:reset                   # prisma migrate reset --force
npm run db:seed                    # node prisma/seed.js
npm run db:studio                  # prisma studio

# Frontend
cd frontend && npm run dev         # next dev
npm run build                      # next build
npm run lint                       # eslint
```

## Architecture Rules

- **Three-tier MVC**: Controller → Service → Repository. No Prisma in controllers.
- **Soft-delete**: Use `deletedAt` field. Filter `deletedAt: null` in all queries including nested includes.
- **Validation**: Zod schemas in `backend/src/schemas/`. Validate in middleware before controller.
- **Error handling**: Throw `AppError` (custom class). Global error middleware catches all.
- **Auth**: JWT token. Rate-limited login (5 attempts/15min).
- **Logging**: Structured logger with requestId.

## Frontend Rules

- Read `frontend/AGENTS.md` — Next.js 16 has breaking changes vs training data.
- Data fetching via SWR. API calls through `apiFetch` client.
- Auth via Context API.
- Glassmorphism design system with Tailwind.

## Conventions

- No worktree isolation — work directly on files.
- Italian UI labels (clienti, agenda, spese, etc.).
- Prisma schema is source of truth for data model.
