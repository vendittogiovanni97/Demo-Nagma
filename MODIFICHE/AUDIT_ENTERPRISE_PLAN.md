# Demo-Nagma: Enterprise-Grade Single-Tenant CRM
## Audit Completo + Piano di Trasformazione

**Data**: 2026-07-12  
**Versione**: 1.0  
**Autore**: Giovanni Venditto (Analisi AI-First)

---

## Parte 1: Audit della Situazione Attuale

### Dimensione 1: Struttura del Progetto
**Status**: 🟢 **GREEN** (ben organizzato, ma con carenze config)

- ✅ CLAUDE.md esiste (199 linee) — documento chiaro, regole tecniche modularizzate
- ✅ .gitignore esiste e esclude `.env`, `node_modules`, `dist`, `.next`
- ✅ Git repository inizializzato (19 commit, branch develop)
- ✅ Monorepo logico (backend + frontend + landing-page in una repo)
- ⚠️ **Gap**: CLAUDE.md non ha sezione "Configurabilità" o "Deployment per clienti"
- ⚠️ **Gap**: Zero docs su "come installare/configurare per un nuovo cliente"

**Score**: 8/10

---

### Dimensione 2: Architettura Modulare
**Status**: 🟢 **GREEN** (backend ben strutturato, frontend ok)

**Backend** (14 moduli):
- `auth`, `booking`, `customer`, `staff`, `cream`, `finance`, `config`, `whatsapp`, `form-template`, `attachment`
- `newfeature/consenso`, `newfeature/posizionamento` (tattoo-specifici ma isolati)
- ✅ Controller/Service/Routes factory pattern applicato
- ✅ DI Container centralizzato (`core/container/bootstrap.ts`)
- ✅ Handler factory obbligatorio (zero try/catch manuali)
- ✅ Moduli indipendenti — zero cross-module imports (eccetto ConfigService)

**Frontend** (13 moduli):
- ✅ Struttura per modulo, ma **niente mirror del backend** — integrazioni solo via API
- ✅ Common layer ben isolato (`@/common/*`)
- ⚠️ **Gap**: Niente `services` layer per API — logic direttamente nei componenti

**Score**: 9/10

---

### Dimensione 3: Configurabilità & Feature Flags
**Status**: 🟡 **YELLOW** (struttura esiste, ma incompleta)

**Configurazione attuale**:
- ✅ `.env.example` esiste (backend: 21 var, frontend: 15 var, docker: 24 var)
- ✅ `backend/src/core/config/env.ts` parsa le variabili
- ✅ `Config` modello in Prisma (key-value store per configurazione runtime)
- ⚠️ **Gap**: Nessun layer di configurazione "per cliente" (es: `config/clients/{customerName}/`)
- ⚠️ **Gap**: Hard-codati:
  - Branding: logo, nomi (risolto in `.env` ma non completamente)
  - Colori tema: palette MUI è dark-only, nessuna configurazione light/brand
  - Moduli attivi: nessun feature flag (tutti i moduli importati sempre)
  - Database: schema Prisma è fisso, no extensibility per custom fields

**Score**: 6/10

---

### Dimensione 4: Deployment & Docker
**Status**: 🔴 **RED** (rotto in produzione, inconsistente)

**Problemi critici**:
1. **Docker incompleto**:
   - `infrastructure/docker/backend.Dockerfile` referenzia `init.sql` e `docker-entrypoint.sh` che **NON ESISTONO** ❌
   - `backend/Dockerfile` fa seed inline — inconsistente con infrastructure/ version
   - Nessun `frontend.Dockerfile` in infrastructure/

2. **Config produzione mancante**:
   - `.env.prod` non esiste (solo `.env.example`)
   - `docker-compose.yml` usa variabili hardcoded (es: `POSTGRES_DB=demo_nagma_db`)
   - Nessun `docker-compose.prod.yml` o config alternativo

3. **Database**:
   - `init.sql.old` esiste ma è vecchio e non usato
   - Seed via `backend/scripts/seed.ts` — ok per dev, non idempotente per prod

4. **No certificati SSL**, nessun Nginx proxy, zero health checks in docker-compose

**Score**: 3/10

---

### Dimensione 5: Documentazione & Knowledge Base
**Status**: 🟡 **YELLOW** (tecnica sì, installation/runbook no)

**Presente**:
- ✅ CLAUDE.md (regole tecniche, stack, comandi)
- ✅ `docs/` folder (esiste, ma vuoto?)
- ✅ README nei moduli (alcuni)

**Mancante**:
- ❌ "Installation Guide" per nuovi clienti
- ❌ "Configuration Reference" (quali env var, cosa significa ognuna, setup step-by-step)
- ❌ "Troubleshooting" runbook
- ❌ "Architecture Decision Records" (ADR) — why Prisma? why Express? why MUI?
- ❌ "Environment Setup" (dev, staging, prod — differenze?)
- ❌ Database backup/restore procedures

**Score**: 5/10

---

### Dimensione 6: Sicurezza & Hardening
**Status**: 🟡 **YELLOW** (buone pratiche, ma no hardening deployment)

**Buono**:
- ✅ `.env` non è committato (`.gitignore` corretto)
- ✅ JWT in cookie con httpOnly flag (auth.ts)
- ✅ Password hash con bcrypt (authService)
- ✅ Rate limiter middleware (core/middleware)
- ✅ CORS configurabile via env
- ✅ Soft delete pattern (compliant con data privacy)

**Carenze**:
- ⚠️ No HTTPS/TLS config in docker-compose
- ⚠️ No secret rotation mechanism
- ⚠️ Database credentials visibili in docker-compose.yml (in clear?)
- ⚠️ No audit logging (chi ha fatto cosa, quando, da dove)
- ⚠️ No permission matrix formale (4 ruoli ma no RBAC enforcement chiaro)

**Score**: 7/10

---

### Dimensione 7: Setup & Handoff per Outsourcing
**Status**: 🔴 **RED** (non pronto per delegare a team esterno)

**Mancante**:
- ❌ Installation playbook (step-by-step: clone, setup DB, build, deploy, test)
- ❌ Deployment pipeline (CI/CD: GitHub Actions? GitLab CI? Manual?)
- ❌ Testing checklist (quali test mandar in prod? QA process?)
- ❌ Rollback procedures
- ❌ Monitoring setup (logs, metrics, alerts)
- ❌ SLA/Support runbook
- ❌ Code review guidelines (pull request template? linting? test coverage threshold?)
- ❌ Version control strategy (main vs develop, release branching?)

**Score**: 2/10

---

## Parte 2: Piano di Trasformazione (6 Fasi)

### FASE 1: Fondamento (Settimana 1-2) ✅
**Obiettivo**: Rendere il progetto **clonabile e runnable** su qualsiasi macchina/cliente

#### Task:
1. **Fix Docker Build** ✅
   - [x] Creare `infrastructure/database/init.sql` (seed iniziale)
   - [x] Creare `infrastructure/docker/docker-entrypoint.sh` (health check, migration runner)
   - [x] Dockerfile backend in `backend/Dockerfile`, frontend in `frontend/Dockerfile`
   - [x] Testare `docker compose up` from scratch

2. **Environment Layering** ✅ (approccio modificato)
   - [x] `backend/.env` + `frontend/.env` per dev
   - [x] `backend/.env.production` + `frontend/.env.production` per prod
   - [x] Docker compose divisi in dev/prod con `include`
   - [x] Nessun `.env` in `infrastructure/docker/`

3. **Installation Guide** (scrivere)
   - [ ] "Getting Started" in 10 minuti
   - [ ] Troubleshooting: porti occupati, DB connection errors, etc.
   - [ ] **Deliverable**: `docs/INSTALLATION.md`

#### Owner: DevOps / Full-stack senior

---

### FASE 2: Configurabilità (Settimana 2-3) ⏳ (parziale)
**Obiettivo**: Ogni cliente ha un'installazione identica ma **parametrizzata**

#### Task:
1. **Client Configuration Schema** ⏳
   - [x] `bookingUpdatePassword` aggiunto su `ClientConfig` (migration `add_booking_password_to_client_config`)
   - [x] `bookingService.verifyPassword()` legge da DB
   - [x] `configService.getBookingUpdatePassword()` e `verifyBookingUpdatePassword()`
   - [ ] Schema completo: logo, branding, features JSON, maxUsers, ecc.

2. **Frontend Configurabilità** ⏳
   - [x] `useClientConfig()` hook esistente e funzionante
   - [ ] Theme dinamico basato su `ClientConfig.branding`
   - [ ] Feature flags UI: `if (clientConfig.features.enableCream) { <CreamModule /> }`

3. **Backend Feature Flags**
   - [ ] Middleware `featureFlagMiddleware` da creare
   - [ ] Endpoint da proteggere

4. **Database Extensibility**
   - [ ] `CustomField` modello nuovo
   - [ ] `customData` JSON in entità

#### Owner: Backend architect + Frontend lead

---

### FASE 3: Standardizzazione Moduli (Settimana 3-4)
**Obiettivo**: Ogni modulo è **clonabile, testabile, estensibile**

#### Task:
1. **Module Template**
   - Creare cartella template `/backend/src/modules/_template/`
   - Include: controller, service, routes, .bootstrap.ts, schemi Zod, test fixture
   - Doc: `docs/MODULE_TEMPLATE.md` (come copiare e adattare)

2. **Service Layer Pattern** ✅ (parziale)
   - [x] `bookingApi.downloadAttachment()` — rimosso axios da AttachmentPreviewModal
   - [x] `consensoService.getConsents()` / `getPdfUrl()` — pulite chiamate dirette
   - [x] `configService.downloadBackup()` — rimosso URL costruito a mano in SuperAdminPanel
   - [ ] Refactor completo su tutti i moduli

3. **Test Coverage**
   - Ogni modulo: min 80% code coverage
   - Test fixture: pre-populated DB state per testing
   - E2E test: setup → action → assert (Playwright o Cypress)

4. **API Contract (OpenAPI)**
   - Generare schema OpenAPI da Zod schemi
   - `npm run openapi:generate` che produce swagger.json
   - Frontend genera client types automatico da swagger

#### Owner: Tech lead + QA engineer

---

### FASE 4: Deployment & CI/CD (Settimana 4-5)
**Obiettivo**: From git push → automatic deploy (staging → prod)

#### Task:
1. **GitHub Actions Pipeline**
   - On PR: lint, test, build, upload artifact
   - On merge to main: build + push Docker image to registry (Docker Hub / ECR / GitHub Container Registry)
   - Manual approval per prod deploy (GitHub environment protection)

2. **Deployment Script**
   - `scripts/deploy.sh` (local deployment per on-premise clients)
   - `scripts/deploy-cloud.sh` (per cloud: Render, Railway, Vercel, AWS)
   - Parametrizzati per `.env` file

3. **Database Migrations in CI/CD**
   - `prisma migrate deploy` (idempotent in prod)
   - Backup DB before migration (via script)
   - Rollback procedure documented

4. **Secrets Management**
   - GitHub Secrets per JWT_SECRET, DB_PASSWORD, API_KEYS
   - Local: `.env.local` (git-ignored)
   - Prod: Docker secrets o env vars da CI/CD provider

#### Owner: DevOps engineer

---

### FASE 5: Documentation & Runbook (Settimana 5-6)
**Obiettivo**: Handoff completo a team esterno o cliente

#### Deliverable:
1. **Installation Guide** (`docs/INSTALLATION.md`)
   - Prerequisiti (Node, Docker, Docker Compose, PostgreSQL client)
   - Setup passo-passo (clone, env, docker up, test)
   - Troubleshooting per scenario comune

2. **Configuration Reference** (`docs/CONFIGURATION.md`)
   - Ogni env var spiegato
   - Feature flags disponibili
   - Custom branding setup
   - Database extensions (custom fields)

3. **Deployment Guide** (`docs/DEPLOYMENT.md`)
   - On-premise setup (customers che autogestiscono)
   - Cloud setup (Render, Railway, AWS examples)
   - Monitoring & logging setup
   - Backup & disaster recovery

4. **Runbook** (`docs/RUNBOOK.md`)
   - "Customer si connette e non vede dati" → debug steps
   - "Performance degradation" → profiling
   - "Upgrade to new version" → migration steps
   - "Scale da 10 a 100 users" → recommendations

5. **Architecture Decision Records** (`docs/adr/`)
   - ADR-001: Perché Express + Prisma + PostgreSQL
   - ADR-002: Perché DI Container pattern
   - ADR-003: Soft delete vs hard delete
   - ADR-004: JWT in cookie vs header

6. **Code of Conduct & Contribution Guide** (`CONTRIBUTING.md`) ✅
   - [x] Branch naming (feature/, bugfix/, hotfix/)
   - [x] Commit message format
   - [x] PR template
   - [x] Code review checklist
   - [x] Test commands (backend + frontend)

#### Owner: Tech writer + Senior developer

---

### FASE 6: Testing & Validation (Settimana 6-7)
**Obiettivo**: Pronto per produzione su cliente nuovo

#### Task:
1. **E2E Testing** ✅ (scaffold)
   - [x] `frontend/e2e/happy-path.spec.ts` — login → dashboard
   - [ ] Full journey: create customer → booking → export → reports

2. **Configuration Testing**
   - [ ] Cliente A: enableCream=true, enableWhatsApp=false
   - [ ] Cliente B: enableCream=false, enableWhatsApp=true
   - [ ] Verifica: moduli disabled non fanno crash, API block correttamente

3. **Load Testing** ✅ (script)
   - [x] `backend/test/load/scenario.k6.js` — 100 utenti, 4 endpoint
   - [ ] Run & validate risultati

4. **Security Audit** ✅ (report avviato)
   - [x] `docs/SECURITY_AUDIT.md` — checklist OWASP Top 10 (18/37)
   - [ ] Completare restanti 19 check

5. **Handoff Sign-off**
   - [ ] Team can fork, clone, setup DB, run tests, deploy independently
   - [ ] Zero blockers in documentation
   - [ ] 3-person test

#### Owner: QA lead + Security engineer

---

## Parte 3: Checklist di Handoff per Delegare a Team Esterno

### Pre-Handoff (Completare prima della Fase 1)
- [ ] Storico decisionali scritto (ADR)
- [ ] Architettura diagrammata (componenti, data flow)
- [ ] Stack tecnologie documentato con reason-why
- [ ] Roadmap 12 mesi chiara (features, deprecations, breaking changes)

### Durante Trasformazione (Completare per Fase 5)
- [ ] Installation guide testato con persona nuova (< 30 min)
- [ ] Configuration reference copre 100% delle opzioni
- [ ] Deployment pipeline funzionante (PR → test → deploy staging, manual prod)
- [ ] Module template + example module (copy-paste ready)
- [x] E2E tests scaffold (happy path login → dashboard)
- [ ] Test coverage >= 80%, E2E tests full journey
- [ ] Monitoring setup (logs, metrics, alerting)
- [ ] Performance baseline captured (response times, DB query counts)

### Post-Handoff (Team Esterno)
- [ ] **SLA documento**: response time, uptime target, support hours
- [ ] **Escalation path**: problema → L1 (team) → L2 (expert) → L3 (CEO = te)
- [ ] **Code review process**: chi approva PR? criteria?
- [ ] **Incident management**: issue tracker, post-mortem template
- [ ] **Version bumping**: semantic versioning (major.minor.patch), changelog format
- [ ] **Dependencies**: npm audit cadence, security patches procedure
- [ ] **Monthly sync**: retrospective, roadmap planning, feature requests

---

## Parte 4: Matrice Sforzo / Impatto

| Fase | Sforzo | Impatto | Owner | Settimane |
|------|--------|---------|-------|-----------|
| 1. Fondamento | 🔴 Alto | 🟢 Critico | DevOps | 1-2 |
| 2. Configurabilità | 🟡 Medio-Alto | 🟢 Critico | Backend/Frontend | 2-3 |
| 3. Moduli | 🟡 Medio | 🟡 Alto | Tech lead | 3-4 |
| 4. CI/CD | 🟡 Medio | 🟡 Alto | DevOps | 4-5 |
| 5. Docs | 🟡 Medio | 🟢 Critico | Writer/Dev | 5-6 |
| 6. Testing | 🟢 Basso | 🟢 Critico | QA | 6-7 |

**Timeline totale**: 7 settimane = ~2 mesi a tempo pieno.  
**Team ideale**: 1 DevOps, 1 Backend, 1 Frontend, 1 QA, 1 Tech Writer.

---

## Parte 5: Esempio: Onboarding Nuovo Cliente

### Scenario: "Tattoo Shop Roma" vuole usare Demo-Nagma

1. **Setup Infrastructure** (10 min)
   ```bash
   git clone https://github.com/yourusername/demo-nagma.git tattoo-shop-roma
   cd tattoo-shop-roma
   cp .env.example .env
   # Edit .env: clientName="Tattoo Shop Roma", logo URL, etc.
   docker compose up
   ```

2. **Access & Configure** (5 min)
   - Open http://localhost:3000
   - Login: admin@tattoo-shop-roma.local / (default password from docs)
   - Dashboard → Settings: upload logo, set colors, enable/disable modules
   - Result: branded, configured app in 15 min

3. **Populate Data** (30 min)
   - Invite team: 3 staff members
   - Create initial schedule (working hours, day off)
   - Configure WhatsApp template (optional)
   - Ready to use

4. **Deploy to Production** (20 min)
   ```bash
   # Production deployment (via your cloud provider or on-premise script)
   docker compose -f docker-compose.prod.yml up -d
   # Verify: healthcheck pass, DB migrated, backups scheduled
   ```

**Total: ~1 hour per new customer to fully operational.**

---

## Parte 6: Owner/Stakeholder Mapping

| Componente | Owner | Revisore | Deadline |
|------------|-------|----------|----------|
| Docker/Infrastructure | DevOps lead | You | Week 2 |
| Backend Configurabilità | Backend architect | You | Week 3 |
| Frontend Feature flags | Frontend lead | You | Week 3 |
| CI/CD Pipeline | DevOps engineer | CTO | Week 5 |
| Documentation | Tech writer | You | Week 6 |
| E2E Testing | QA lead | Dev manager | Week 7 |
| Security audit | Security engineer | CISO / You | Week 7 |

---

## Parte 7: Risk & Mitigation

| Rischio | Probabilità | Impatto | Mitigation |
|---------|-------------|---------|------------|
| Docker build ancora rotto (init.sql missing) | 🔴 Alta | 🔴 Critico | Week 1: test con git clone fresh repo |
| Config DB schema non backward-compat | 🟡 Media | 🟡 Alto | Week 2: migration script, test upgrade path |
| Performance regredisce con config checks | 🟡 Media | 🟡 Medio | Week 4: load test, add caching layer |
| Team esterno non capisce moduli pattern | 🟡 Media | 🟡 Medio | Week 5: template module + tutorial video |
| Rollback da prod non testato | 🔴 Alta | 🔴 Critico | Week 6: disaster recovery drill |

---

## Conclusione

**State**: Demo-Nagma è un **CRM ben-architettato ma non-production-ready per customers**.

**After transformation**: Un **SaaS single-tenant enterprise-grade** che:
- ✅ Clonabile e runnable in 15 minuti
- ✅ Configurabile per qualsiasi tattooist/cliente (non solo tattoo shops)
- ✅ Deployabile in AWS, on-premise, cloud provider a scelta
- ✅ Pronto per delegare a team di 5-6 persone
- ✅ Documentato e supportabile 24/7

**Next step**: Confermare priorità (Fase 1 subito?), allocare team, kickoff.

---

**Documento versione**: 1.0  
**Last updated**: 2026-07-12  
**Preparato per**: Handoff a team esterno
