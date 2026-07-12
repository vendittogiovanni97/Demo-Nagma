# Demo Nagma — Tattoo CRM

Gestionale completo per studio tatuaggi. Backend Express + Prisma, frontend Next.js + MUI.

## Avvio rapido

```bash
cd backend && npm install && cd ../frontend && npm install
docker compose up -d              # PostgreSQL
npm run dev                       # backend:3001 + frontend:3000
```

## Stack

| Layer | Tech |
|-------|------|
| Backend | Express 5, Prisma 7.8, PostgreSQL 17, Zod 4, JWT/bcrypt |
| Frontend | Next.js 16, React 19, MUI 9, SWR, AG Grid, FullCalendar |
| Landing | HTML/CSS/JS statico |

## Comandi principali

```bash
npm run dev                          # backend + frontend in parallelo
docker compose up -d                 # stack Docker completo
docker compose down                  # ferma tutto
cd backend && npm run db:migrate     # nuova migration Prisma
cd backend && npm run db:seed        # seed idempotente
cd backend && npx jest --forceExit   # test backend (130+)
cd frontend && npm run test:e2e      # test E2E (Playwright)
cd backend && k6 run test/load/scenario.k6.js  # load test
```

## Progetti

- `backend/` — API REST Express + Prisma
- `frontend/` — CRM Next.js + MUI
- `landing-page/` — Sito marketing
- `infrastructure/docker/` — Docker compose separati per db, backend, frontend
- `infrastructure/database/` — Script init PostgreSQL

## Seed

Dati di seed in `backend/prisma/seed-data/`. Profilo selezionabile via `SEED_PROFILE`.

```bash
SEED_PROFILE=nagma cd backend && npx prisma db seed
```

## Ambiente

Ogni cartella ha `.env` (dev) e `.env.production` (prod). Nessun `.env.example` — i template sono nei file stessi.

## Security

Checklist OWASP in `docs/SECURITY_AUDIT.md`. Load test in `backend/test/load/`.

