# Demo-Nagma Installation Guide

Installa e avvia Demo-Nagma (Tattoo CRM) in meno di 15 minuti.

## Prerequisiti

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (v18+)
- [Docker](https://www.docker.com/get-started) + [Docker Compose](https://docs.docker.com/compose/install/) v2.0+
- PostgreSQL client (opzionale, per accesso diretto DB)

## Quickstart — Docker (10 minuti)

```bash
# 1. Clona il repository
git clone <repo-url>
cd Demo-Nagma

# 2. Configura gli .env (copiare e modificare)
cp backend/.env.production backend/.env      # modifica DATABASE_URL, JWT_SECRET
cp frontend/.env.production frontend/.env    # modifica NEXT_PUBLIC_API_BASE_URL

# 3. Avvia tutto
docker compose up -d

# 4. Verifica
docker compose ps                            # tutti i servizi "healthy"/"running"
curl http://localhost:3001/health            # {"status":"ok","db":"connected"}
```

Accedi a:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Swagger**: http://localhost:3001/api-docs

### Credenziali default (dopo seed)
| Ruolo | Email | Password |
|-------|-------|----------|
| Super Admin | `superadmin@nagma.it` | `superadmin123` |
| Admin | `admin@nagma.it` | `admin123` |

Le credenziali sono definite in `backend/prisma/seed-data/nagma.json`.

## Quickstart — Sviluppo locale (senza Docker)

```bash
# 1. Avvia solo il database via Docker
docker compose -f infrastructure/docker/docker-compose.db.yml up -d

# 2. Installa dipendenze
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 3. Configura backend/.env e frontend/.env

# 4. Database setup
cd backend
npm run db:migrate                           # crea tabelle
SEED_PROFILE=nagma npx prisma db seed        # popola dati iniziali
cd ..

# 5. Avvia in parallelo
npm run dev                                  # dalla root: backend (3001) + frontend (3000)
```

## Struttura .env

**backend/.env**:
```
DATABASE_URL=postgresql://root:root123@localhost:5432/nagmadb_?schema=public
JWT_SECRET=<stringa ≥32 caratteri>
PORT=3001
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000
SEED_PROFILE=nagma
```

**frontend/.env**:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_PORTAL_NAME=Nagma Tattoo
NEXT_PUBLIC_PORTAL_SHORT_NAME=Nagma
NEXT_PUBLIC_PORTAL_LOGO=/nagma-logo.svg
```

## Troubleshooting

### Port conflict
```bash
lsof -ti :3000 | xargs kill -9   # libera porta 3000
lsof -ti :3001 | xargs kill -9   # libera porta 3001
```

### Database non raggiungibile
```bash
docker compose -f infrastructure/docker/docker-compose.db.yml logs postgres
docker compose -f infrastructure/docker/docker-compose.db.yml restart
```

### Build fallisce
```bash
docker compose build --no-cache
```

### Seed fallisce
```bash
cd backend && npm run db:reset   # ⚠️ DISTRUTTIVO: cancella e ricrea tutto
```

## Prossimi passi

1. Login come Super Admin → Admin Panel → configura feature flags e branding
2. `docs/CONFIGURATION.md` — reference variabili d'ambiente
3. `docs/DEPLOYMENT.md` — deployment in produzione
4. `docs/SECURITY_AUDIT.md` — checklist sicurezza

---

*Ultimo aggiornamento: 13 Luglio 2026*
