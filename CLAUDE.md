# CLAUDE.md — Demo Nagma (Tattoo CRM)

## Regole Tecniche Dettagliate (Rules)
Le regole tecniche complete sono nei file modulari:
- @.claude/rules/backend-patterns.md — controller/service, DI container, handler factory, bootstrap
- @.claude/rules/database.md — migration workflow, mai prisma db push, seed
- @.claude/rules/code-style.md — loading/error state, commenti, TypeScript
- @.claude/rules/ui-components.md — componenti UI, modali, form, colori

## Regole Assolute — Seguire SEMPRE

1. **Rispondi in italiano** — sempre, qualunque lingua usi l'utente.
2. **Nessun colore hardcoded** — usa sempre `theme.palette.*` o token del tema. Mai `#hex`, `rgba(...)`, `'red'` inline nell'`sx`.
3. **Loading e Error via toast/provider** — mai `useState` sparsi per loading/errore API. Usa `useToast()` per feedback globali.
4. **Mai `prisma db push`** — solo Prisma Migrations (`prisma migrate dev`).
5. **Mai committare .env** — solo `.env.example` nel repo.
6. **Un solo httpClient** — usa sempre `apiClient` da `@/common/shared/api/client`. Mai duplicare client HTTP.
7. **Handler factory obbligatorio** — usa `handleSearch`, `handleGetById`, `handleCreate`, `handleUpdate`, `handleDelete` da `core/utils/handler.ts`. Mai try/catch manuali nei controller.

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
    core/
      config/       # env.ts, swagger.ts
      container/    # DI container (index.ts) + bootstrap centralizzato (bootstrap.ts)
      database/     # crudService.ts
      middleware/   # auth, error, rateLimiter, response
      shared/       # errors/AppError, kernel/ (pagination), utils/ (prisma, logger, validation, cache, etc.)
      utils/        # handler.ts (factory), crudRoutes.ts (factory)
    modules/
      auth/         # login, register, me, refresh
      customer/     # anagrafica clienti
      booking/      # prenotazioni + history + artisti disponibili
      staff/        # collaboratori + turni
      finance/      # transazioni + spese libere + trend + performance
      form-template/# template form dinamici
      whatsapp/     # template messaggi + invio manuale + log
      cream/        # vendita creme
      attachment/   # upload/download file
      config/       # configurazione di sistema (key-value da DB)
      newfeature/
        consenso/       # consenso digitale tattoo (accesso pubblico)
        posizionamento/ # mappa corpo per posizionamento tattoo
    routes.ts     # registerRoutes(app) — monta tutte le route
    app.ts        # Express app factory (chiama bootstrapContainer + registerRoutes)
    index.ts      # entry point con lifecycle + crash recovery
  test/
    modules/      # test unitari per ogni modulo (13 suite, 130 test)
frontend/
  src/
    app/          # Next.js App Router (17 route)
    common/       # @/common/* — condiviso tra tutti i moduli
      components/ # auth/, common/, data-display/, debug/, feedback/, forms/, layout/, modals/, providers/, ui/, widgets/
      config/     # branding, env, nav-links, roles, staff-config, status-config, whatsapp
      context/    # AuthContext, ThemeContext (breakpoint)
      hooks/      # useBreakpoint, useDebouncedValue, useDeleteConfirm, useFormModal, useToast, usePaginationFilters
      shared/     # api/ (client, endpoints), schemas/, services/, types/ (enums, pagination), utils/
      theme/      # MUI theme dark (theme.ts), inputStyles.ts
    modules/      # agenda, auth, booking, customer, staff, finance, creams, spese, form-templates,
                  #   whatsapp, dashboard, booking-history, superadmin, newfeature/{consenso,posizionamento}
  test/
    hooks/        # test hook (useDebouncedValue, useDeleteConfirm, useFormModal, usePaginationFilters)
    shared/       # test api/utils
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

# Test
cd backend && npx jest --forceExit     # 13 suite, 130 test
cd frontend && npx jest               # hook + unit test

# Docker
docker compose up -d               # avvia stack completo (postgres + backend + frontend)
docker compose down                 # ferma tutto
```

## Architettura Backend

Ogni modulo segue questa struttura:
```
modules/{nome}/
  controllers/     # controller Express (usa handler factory)
  services/        # business logic (service class)
  routes/          # registrazione route Express
  {nome}.bootstrap.ts  # registra service + controller nel DI container
```

Schemi Zod per validazione sono nei controller o in file `*.schemas.ts` dedicati.

### DI Container
```typescript
// core/container/index.ts — classe Container con register/get
// core/container/bootstrap.ts — chiama tutti i {modulo}.bootstrap.ts
// {modulo}.bootstrap.ts — istanzia service + controller e li registra

// Esempio:
export function bootstrapAuth(): void {
  const authService = new AuthService();
  const authController = new AuthController(authService);
  container.register(AuthService, authService);
  container.register(AuthController, authController);
}
```

### Handler Factory (OBBLIGATORIO)
```typescript
import { handleSearch, handleGetById, handleCreate, handleUpdate, handleDelete } from '../../core/utils/handler';

// Nel controller:
search = handleSearch((query) => this.service.search(query));
getById = handleGetById((id) => this.service.getById(id));
create = handleCreate((data, userId) => this.service.create(data, userId));
```

### CRUD Routes Factory
```typescript
import { registerCrudRoutes } from '../../core/utils/crudRoutes';

// Nelle routes:
registerCrudRoutes(app, {
  basePath: '/api/customers',
  handlers: { search, getById, create, update, delete: remove },
});
```

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

**Un solo client**: `apiClient` da `@/common/shared/api/client.ts`.
- `apiClient.get/post/put/patch/delete` per chiamate dirette.
- `createCrudService<T>(basePath, byIdPath)` per CRUD standard.
- Axios solo per upload file multipart (`useAttachments`).

## Database — Schema Prisma

17 modelli, 5 enum. Schema singolo in `backend/prisma/schema.prisma`.
Soft delete con `deletedAt` su tutti i modelli eccetto audit log (BookingHistory, TransactionHistory).
Tutte le tabelle hanno `@@map` per snake_case (es. `users`, `bookings`, `cream_sales`).
Relazioni con `onDelete` esplicito: Cascade per relazioni padre-figlio, SetNull per opzionali, Restrict per obbligatorie.

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
