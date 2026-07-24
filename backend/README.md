# Backend — Nagma Tattoo CRM

API REST del gestionale Nagma per clienti, prenotazioni, staff, finanze, configurazione e reportistica.

## Stack

| Strato | Tecnologia |
|---|---|
| Runtime | Node.js 22+ e npm 10+ |
| API | Express 5, TypeScript 6, Zod 4 |
| Database | PostgreSQL 17, Prisma 7.8 con adapter `pg` |
| Sicurezza | JWT, bcrypt, Helmet, CORS, rate limiting |
| Output | Swagger/OpenAPI, ExcelJS, PDFKit |
| Test | Jest: unit, integration e security |

## Struttura reale

```text
backend/
├── prisma/
│   ├── migrations/          # Migrazioni versionate
│   ├── seed-data/           # Profili JSON dei seed
│   ├── schema.prisma        # Schema PostgreSQL
│   ├── seed.ts              # Seed di base
│   └── seed_demo_data.ts    # Dati dimostrativi
├── src/
│   ├── core/
│   │   ├── config/          # Ambiente e Swagger
│   │   ├── container/       # Container DI e bootstrap globale
│   │   ├── middleware/      # Auth, errori, feature flag, rate limit
│   │   ├── shared/          # Errori, kernel e utility condivise
│   │   └── utils/           # Handler e route CRUD riutilizzabili
│   ├── modules/             # Moduli di dominio
│   ├── app.ts               # Configurazione Express
│   ├── routes.ts            # Registro centralizzato dei moduli
│   └── index.ts             # Avvio e ciclo di vita del server
├── test/
│   ├── modules/             # Test unitari
│   ├── integration/         # Test HTTP con server e database
│   ├── security/            # Verifiche OWASP
│   └── load/                # Scenario k6
├── package.json
├── prisma.config.ts
└── tsconfig.json
```

Ogni modulo applicativo segue normalmente questa struttura:

```text
src/modules/<modulo>/
├── controllers/
├── routes/
├── services/
├── types/ o schema dedicato
└── <modulo>.bootstrap.ts
```

I moduli registrati sono: attachment, auth, booking, config, cream, custom-field, customer, export, finance, form-template, metrics, reports, saved-views, staff, user e whatsapp. `_template` è uno scaffold e non viene registrato in produzione.

## Aggiornamenti Architetturali — Luglio 2026

- I service di booking, customer, finance, reports, staff e WhatsApp applicano contratti e query coerenti con soft delete e paginazione condivisa.
- Lo schema Zod dello staff usa esclusivamente `COLLABORATORE` e `APPRENDISTA`, come l'enum Prisma `StaffType`.
- Il modulo export centralizza CSV, Excel e PDF; i layout PDF sono separati in `src/modules/export/templates/` e le utility comuni in `src/modules/export/utils/pdf.utils.ts`.
- I report espongono dati normalizzati attraverso controller e service del modulo, senza logica di presentazione nel frontend.
- I test unitari includono regressioni dedicate ai contratti dello staff, alle prenotazioni e alle transazioni finanziarie.

## Flusso applicativo

```text
HTTP → route/middleware → controller → service → Prisma → PostgreSQL
```

- Le route vengono registrate in `src/routes.ts`.
- Le dipendenze sono registrate dai bootstrap dei moduli e aggregate in `src/core/container/bootstrap.ts`.
- I controller CRUD usano le factory di `src/core/utils/handler.ts`; gli errori arrivano al middleware globale.
- I service contengono logica di business e query Prisma.
- Le entità che supportano la cancellazione logica devono filtrare `deletedAt: null`.

## Autenticazione e sicurezza

Le API protette richiedono `Authorization: Bearer <token>`. I ruoli disponibili sono:

- `SUPER_ADMIN`
- `ADMIN`
- `USER`
- `ARTIST`

L’applicazione applica Helmet, CORS configurabile, rate limiting, validazione Zod e sanitizzazione dei log. `JWT_SECRET` deve contenere almeno 32 caratteri.

## Database e seed

La connessione è letta da `DATABASE_URL` tramite `prisma.config.ts`. Non usare `prisma db push`: ogni modifica allo schema richiede una migrazione.

```bash
npm run db:migrate       # crea/applica una migrazione in sviluppo
npm run db:migrate:prod  # applica migrazioni esistenti
npm run db:seed          # carica il profilo JSON configurato
npm run db:seed:demo     # aggiunge dati dimostrativi
npm run db:studio        # apre Prisma Studio
```

I dati di seed devono stare in `prisma/seed-data/*.json`, non essere incorporati in `seed.ts`.

## Avvio

Dalla root del repository:

```bash
npm run db:up
npm run db:migrate
npm run db:seed
npm run dev
```

Oppure dalla cartella `backend`:

```bash
npm install
npm run dev
```

Il backend usa normalmente `http://localhost:3001`; la documentazione Swagger è disponibile su `/api-docs` e l’health check su `/health`.

## Variabili principali

Consultare `.env.example`. Le variabili essenziali sono:

```text
DATABASE_URL
JWT_SECRET
PORT
NODE_ENV
CORS_ORIGINS
```

Sono inoltre disponibili configurazioni per scadenza JWT, rate limit, paginazione, logging, payload, inizializzazione configurazioni e riavvio controllato. Il limite di pagina predefinito è 25 e può essere sovrascritto con `DEFAULT_PAGE_LIMIT`.

Non committare mai `.env` o segreti.

## Verifica

```bash
npx tsc --noEmit
npx jest --forceExit
```

La suite completa avvia automaticamente il backend per i test integration/security e richiede un database PostgreSQL raggiungibile. Per eseguire solo i test unitari:

```bash
npm run test:unit
```

La suite completa usa `test/setup/globalSetup.ts`, avvia il backend e attende `/health`; richiede PostgreSQL e la porta di test disponibili. Se il global setup va in timeout, verificare prima ambiente, database, porta e log di avvio.

Altri comandi:

```bash
npm run test:integration
npm run test:api
npm run build
```
