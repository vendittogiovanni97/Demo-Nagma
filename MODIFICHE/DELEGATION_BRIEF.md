# Demo-Nagma: Brief per Team di Sviluppo

**Per**: Team che assumerà ownership del progetto  
**Da**: Giovanni Venditto (CTO)  
**Data**: 2026-07-12  
**Confidenziale**: No — condividi con team

---

## Executive Summary

Demo-Nagma è un **Tattoo CRM** (prenotazioni, staff, finanze, inventario) scritto in **Express + Next.js + PostgreSQL**.

Obiettivo: **Trasformarlo da prodotto single-customer in SaaS multi-installazione** che qualsiasi cliente possa installare in locale in 15 minuti.

Timeline: **7 settimane**, team: **5-6 persone**.

---

## Lo Stato Attuale

### ✅ Cosa Funziona

- **Backend architettura solida**: Express + Prisma con DI container, handler factory, zero boilerplate
- **14 moduli riutilizzabili**: auth, booking, customer, staff, cream, finance, whatsapp, form-template, config, attachment, newfeature (consenso, posizionamento)
- **Frontend moderno**: Next.js 16, React 19, MUI 9, SWR, AG Grid, FullCalendar
- **Database ben-strutturato**: 17 modelli, soft delete pattern, audit logs
- **Documentazione tecnica**: CLAUDE.md copre stack + architettura + regole
- **Testing**: 13 test suite, 130 test (backend)
- **Docker**: docker-compose.yml esiste

### 🔴 Cosa Non Funziona (o è incompleto)

1. **Docker rotto in produzione**
   - `infrastructure/docker/backend.Dockerfile` referenzia `init.sql` e `docker-entrypoint.sh` che non esistono
   - Dockerfile duplicati (root `/backend/Dockerfile` vs `infrastructure/docker/backend.Dockerfile`)
   - Nessun `frontend.Dockerfile`

2. **Zero configurabilità per cliente**
   - Hard-coded: nome app, logo, colori tema, branding
   - No feature flags (tutti i moduli caricati sempre)
   - DB schema fisso (no custom fields per cliente)
   - No client configuration layer

3. **Deployment incompleto**
   - No `.env.prod` (solo .env.example)
   - No CI/CD pipeline (GitHub Actions)
   - No Nginx/SSL config
   - No health checks, monitoring, alerting

4. **Documentazione frammentaria**
   - Installation guide = zero
   - Configuration reference = zero
   - Troubleshooting = zero
   - Architecture Decision Records = zero
   - Deployment runbook = zero

5. **Handoff non pronto**
   - Code review process sconosciuto
   - Test coverage non verificato
   - Zero E2E tests
   - No SLA / incident management
   - Nessun "team onboarding playbook"

---

## Le 6 Fasi (Roadmap Dettagliato)

> **Sessione 12/7/2026**: ~40 task completati in Docker, env, seed, Prisma 7, frontend service layer, test, docs. Vedi `SESSION_SUMMARY.md` per dettaglio.

### Fase 1: Fix Foundation (Settimana 1-2)
**Goal**: Il progetto deve clonabile e runnable da zero.

**Task specifici**:

1. **Docker build working** ✅
   - [x] Create `infrastructure/docker/init.sql` (seed iniziale)
   - [x] Create `infrastructure/docker/docker-entrypoint.sh` (migrations, health checks)
   - [x] Consolidate: Dockerfile per backend (in `backend/Dockerfile`)
   - [x] Create `frontend/Dockerfile`
   - [x] Test: `docker compose up` from fresh git clone

2. **Environment management** ✅ (approccio modificato: env per cartella app, non in infrastructure/docker/)
   - [x] Create `backend/.env` + `frontend/.env` per dev
   - [x] Create `backend/.env.production` + `frontend/.env.production` per prod
   - [x] Create 3 `docker-compose.prod.yml` files
   - [x] Document vars in `CLAUDE.md`

3. **Installation Guide** (`docs/INSTALLATION.md`)
   - [ ] Prerequisites (Node, Docker, Docker Compose, git)
   - [ ] 10-minute quickstart (clone → env → docker up → test)
   - [ ] Troubleshooting section (port conflicts, DB connection, Docker issues)
   - [ ] Verify: one unfamiliar person follows guide, succeeds in < 15 min

**Acceptance Criteria**:
- Fresh git clone + 3 commands = running app
- No broken Dockerfile references
- All env vars have defaults or clear error message

**Owner**: DevOps engineer (1.5 weeks)

---

### Fase 2: Client Configurability (Settimana 2-3)
**Goal**: Una installazione per Cliente A (enableCream=true, enableWhatsApp=false) è diversa da Cliente B senza codice changes.

**Task specifici**:

1. **Database schema extension**
   - [ ] New `ClientConfig` table:
     ```sql
     - id (primary key)
     - clientName string (es: "Tattoo Shop Italia")
     - clientLogoUrl string
     - clientTimeZone string (default: Europe/Rome)
     - clientLocale string (default: it-IT)
     - primaryColor, secondaryColor hex
     - features JSON { enableCream, enableWhatsApp, enableFormTemplate, ... }
     - maxUsers int, maxBookings int, maxAttachmentSizeMB int
     - apiRateLimitPerMinute int
     - createdAt, updatedAt
     ```
   - [ ] Prisma migration: `npx prisma migrate dev --name add_client_config`
   - [ ] Seed script: insert one ClientConfig per installation

2. **Backend: Feature Flags**
   - [ ] New middleware `featureFlagMiddleware(featureName)` che blocca endpoint se disabled
   - [ ] Example: `router.post('/cream/sales', featureFlagMiddleware('enableCream'), ...)`
   - [ ] Update 4 endpoints: `/cream/*`, `/whatsapp/*`, `/form-template/*`, `/config/*`
   - [ ] Unit test: verify middleware blocks disabled features

3. **Frontend: Dynamic Branding**
   - [ ] New API: `GET /api/config/client` returns `ClientConfig`
   - [ ] New hook: `useClientConfig()` fetches + caches config
   - [ ] Update navbar: use `clientConfig.clientLogoUrl` and `clientConfig.clientName`
   - [ ] Update theme: apply `clientConfig.primaryColor`, `clientConfig.secondaryColor` to MUI palette
   - [ ] Update module imports: wrap in `if (clientConfig.features.enableCream) { <CreamModule /> }`

4. **Admin UI for ClientConfig**
   - [ ] New route: `/settings` (admin-only)
   - [ ] Form fields: clientName, logo upload, color picker (primary/secondary), feature toggles
   - [ ] Save to `ClientConfig` table
   - [ ] Verify: changes apply immediately (no rebuild)

**Acceptance Criteria**:
- Two installations running same code, different configs → zero issues
- Feature toggle disables entire feature (UI + API)
- Logo + colors change without restart

**Owner**: Backend architect (1 week) + Frontend lead (1 week), parallel

---

### Fase 3: Module Standardization (Settimana 3-4)
**Goal**: Ogni modulo è documentato, testato, clonabile.

**Task specifici**:

1. **Module template**
   - [ ] Create `/backend/src/modules/_template/` directory
   - [ ] Include: controller.ts, service.ts, routes.ts, _template.bootstrap.ts, types.ts, *.schemas.ts
   - [ ] Include test: `_template.service.test.ts` (fixture, happy path, error cases)
   - [ ] Document: `docs/MODULE_TEMPLATE.md` (copy this folder, rename, register in bootstrap.ts)

2. **Service layer (frontend)** ✅
   - [x] Refactor: move API calls out of React components into `services/` layer
   - [x] `bookingApi.downloadAttachment()` creato
   - [x] `consensoService.getConsents()` / `getPdfUrl()` creato
   - [x] `configService.downloadBackup()` creato
   - [x] AttachmentPreviewModal, useConsentList, ConsentListPage, SuperAdminPanelPage aggiornati
   - [ ] Continue refactor: other modules

3. **Test coverage**
   - [ ] Target: >= 80% code coverage per modulo
   - [ ] Run: `npm test -- --coverage` per backend
   - [ ] CI: add coverage check to GitHub Actions (fail if < 80%)

4. **OpenAPI/Swagger**
   - [ ] Generate OpenAPI schema from Zod schemas (use `zod-to-openapi` library)
   - [ ] Endpoint: `GET /api/docs` returns Swagger UI
   - [ ] Auto-generate frontend client types: `npm run openapi:generate` → creates `generated/api-client.ts`
   - [ ] Verify: no manual types needed, all from OpenAPI

**Acceptance Criteria**:
- One person copies `_template`, renames to new module, it works without debugging
- All moduli >= 80% coverage
- Swagger docs auto-generated, up-to-date with code

**Owner**: Tech lead + QA engineer (parallel, 1.5 weeks each)

---

### Fase 4: Deployment & CI/CD (Settimana 4-5)
**Goal**: git push → tests run → staging deploy → manual approval → prod deploy.

**Task specifici**:

1. **GitHub Actions Pipeline**
   - [ ] Create `.github/workflows/test.yml`:
     - On PR: lint (ESLint, Prettier), test (jest), build (Next.js, Express)
     - Run against `.env.development` (test DB)
   - [ ] Create `.github/workflows/deploy.yml`:
     - On merge to main: build Docker image, push to Docker Hub / GitHub Container Registry
     - Trigger staging deploy automatically
     - Manual approval for prod (GitHub environment protection)

2. **Deployment scripts**
   - [ ] `scripts/deploy-staging.sh` (builds, pushes image, deploys to staging server)
   - [ ] `scripts/deploy-prod.sh` (same but prod, with backup step)
   - [ ] Both scripts: parametrized for env vars
   - [ ] Tested: one person can run these locally without instruction

3. **Database migration safety**
   - [ ] Pre-deploy: backup production DB (`pg_dump`)
   - [ ] Deploy: run `prisma migrate deploy --preview-feature` (shows changes)
   - [ ] Verify: health checks pass
   - [ ] Rollback procedure: documented and tested

4. **Secrets management**
   - [ ] Move secrets to GitHub Secrets: JWT_SECRET, DB_PASSWORD, API_KEYS
   - [ ] Deploy scripts read from CI/CD env vars (not .env file)
   - [ ] Local dev: `.env.local` (git-ignored) for secrets

**Acceptance Criteria**:
- PR → automatic test run → clear pass/fail message
- Merge to main → automatic staging deploy → works in < 5 min
- Manual button click → prod deploy → zero downtime

**Owner**: DevOps engineer (1.5 weeks)

---

### Fase 5: Documentation (Settimana 5-6)
**Goal**: New developer can onboard in 1 day. Customer can self-serve 90% of questions.

**Deliverables**:

1. **Installation Guide** (`docs/INSTALLATION.md`, 2KB)
   - Prerequisites
   - Step-by-step (git clone, env setup, docker compose up)
   - Verify: app works (login, create booking, check reports)
   - Troubleshooting: 5 common issues + fixes

2. **Configuration Reference** (`docs/CONFIGURATION.md`, 3KB)
   - All env vars: what they control, default values, examples
   - Feature flags: list of all flags, what each disables
   - Branding: logo size/format, color specs, custom fonts
   - Database: schema overview, indexes, soft delete behavior
   - Performance: recommended settings for 10, 100, 1000 users

3. **Deployment Guide** (`docs/DEPLOYMENT.md`, 4KB)
   - On-premise (customer self-hosts): hardware reqs, setup steps, backup strategy
   - Cloud: examples for AWS, Render, Railway, Vercel (one per example)
   - Monitoring: which logs to watch, metrics to track, alerts to set
   - Scaling: when to add read replicas, caching layer, CDN, etc.

4. **Runbook** (`docs/RUNBOOK.md`, 3KB)
   - "Database connection failed" → debug steps
   - "App is slow" → profiling + optimization steps
   - "Upgrade to new version" → migration steps
   - "Restore from backup" → step-by-step
   - "Add new customer" → 5 steps

5. **Architecture Decisions** (`docs/adr/ADR-*.md`, 5 docs)
   - ADR-001: Express + Prisma + PostgreSQL (why not Django/Rails/Nest?)
   - ADR-002: DI Container pattern (why not singletons?)
   - ADR-003: Soft delete vs hard delete
   - ADR-004: JWT in cookie vs Authorization header
   - ADR-005: Single tenant (why not multi-tenant SaaS?)

6. **Contributing Guide** (`CONTRIBUTING.md`, 2KB) ✅
   - [x] Branch naming, commit format, PR template, code review checklist
   - [x] Test commands (backend + frontend)
   - [ ] Release: semantic versioning, changelog, git tags

**Acceptance Criteria**:
- Unfamiliar dev reads Installation.md → installs in 15 min with zero blockers
- Customer has question → finds answer in Configuration or Runbook
- New feature → contributor knows exactly what branch/commit/PR format to use

**Owner**: Tech writer + 1 senior dev (1.5 weeks)

---

### Fase 6: Testing & Validation (Settimana 6-7)
**Goal**: Confident that product works in real-world scenarios.

**Task specifici**:

1. **End-to-End Testing** ✅ (scaffold)
   - [x] Create `frontend/e2e/happy-path.spec.ts` (Playwright) — login → dashboard
   - [ ] Complete: full user journey (create customer → booking → export)
   - [ ] Run on every PR (CI)

2. **Configuration Testing**
   - [ ] Test Matrix:
     - Setup 1: enableCream=true, enableWhatsApp=false
     - Setup 2: enableCream=false, enableWhatsApp=true
     - Setup 3: all features disabled
   - [ ] Verify: UI doesn't crash, API blocks disabled features, no SQL errors

3. **Load Testing** ✅ (script)
   - [x] Create `backend/test/load/scenario.k6.js` — 100 concurrent users, 4 endpoints
   - [ ] Run: `k6 run` and validate results
   - [ ] If slow: add indexes, enable caching, identify bottleneck

4. **Security Audit** ✅ (report avviato)
   - [x] Create `docs/SECURITY_AUDIT.md` — OWASP Top 10 checklist (18/37 checks)
   - [ ] Complete: remaining 19 checks
   - [ ] Automated: npm audit, Snyk, SAST scan

5. **Onboarding Simulation**
   - [ ] 3 new developers (unfamiliar with codebase)
   - [ ] Give them: git clone, Installation.md, 0 other help
   - [ ] Measure: time to first working feature (edit + test + PR)
   - [ ] Pass criterion: < 4 hours each

**Acceptance Criteria**:
- E2E tests pass on every PR
- Load test: 100 users, response time < 2 sec
- Security: zero critical findings, < 3 medium issues
- Onboarding: 3 devs succeed in < 4 hours each

**Owner**: QA lead + security engineer (parallel, 1 week each)

---

## Team & Roles

| Role | Weeks | FTE | Responsibilities |
|------|-------|-----|------------------|
| DevOps Engineer | 1, 4, 7 | 0.5 (not full 7 wks) | Docker, deploy scripts, CI/CD, health checks |
| Backend Architect | 2, 3 | 1.0 | Config schema, feature flags, API layer |
| Frontend Lead | 2, 3 | 1.0 | Dynamic branding, feature UI, service layer |
| Tech Lead | 3 | 0.5 | Module template, architecture review |
| QA Engineer | 3, 6 | 1.0 | Test coverage, E2E, load testing, security |
| Tech Writer | 5 | 1.0 | All documentation |
| Security Engineer | 6 | 0.5 (last 2 weeks) | Security audit, vulnerability scan |
| Project Manager | 1-7 | 0.5 | Track progress, unblock team, stakeholder comms |

**Total effort**: ~6 FTE-weeks = 1 full team for 6 weeks, or part-time for longer.

---

## Success Criteria

By end of Week 7, the product must satisfy:

### Installability
- [ ] Fresh git clone + `docker compose up` works in < 10 min
- [ ] All env vars have sensible defaults or clear error message
- [ ] Unfamiliar person installs without help in < 15 min

### Configurability
- [ ] Client A and Client B run same code, different configs
- [ ] Branding (logo, colors) changes without rebuild
- [ ] Features toggle on/off without affecting other features
- [ ] No hardcoded customer-specific data in code

### Quality
- [ ] >= 80% code coverage (backend)
- [ ] E2E tests for happy path
- [ ] Load test: 100 concurrent users, response time < 2 sec
- [ ] Security: OWASP Top 10 checklist PASSED

### Documentation
- [ ] Installation guide: customer onboards in < 30 min
- [ ] Configuration reference: all options documented
- [ ] Deployment guide: customer can deploy to AWS in < 1 hour
- [ ] Architecture ADRs: justification for major decisions

### Handoff Readiness
- [ ] Code review process documented
- [ ] Incident response runbook
- [ ] Contributing guide
- [ ] Team can fork and own independently

---

## Communication Plan

### Weekly Standups
- Monday 10am: blockers, progress, next week plan
- Owner: Project Manager

### Bi-weekly Reviews (with CTO)
- Show working features
- Demo to key stakeholder
- Adjust plan if needed
- Owner: Tech Lead

### Final Sign-off (Week 7)
- Live demo: fresh install → configure → deploy
- Team presents: what we did, how to use, open questions
- Owner: Tech Lead + all contributors

---

## Known Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Docker init.sql still missing | Medium | Critical | Week 1: test from fresh clone |
| Feature flag implementation breaks performance | Medium | High | Week 2: profiling, caching if needed |
| Backward compatibility broken on config upgrade | Low | High | Week 2: migration script, test on prod data |
| Team doesn't understand modular architecture | Medium | Medium | Week 3: module template + walkthrough |
| Deployment pipeline fragile, hard to reproduce | Medium | High | Week 4: manual test by second person |
| Documentation too technical, customers confused | Low | Medium | Week 5: one customer reads docs, gives feedback |
| E2E tests flaky, slow down development | Medium | Medium | Week 6: robust selectors, parallel execution |

---

## What Success Looks Like (In 7 Weeks)

✅ **Giovanni (CTO) can say to customer XYZ:**
> "You can clone our repo, run docker compose up, and have a fully working tattoo shop CRM in 15 minutes. Change the logo, colors, feature toggles via the admin panel. Deploy to your cloud provider or keep it on-premise. It's yours — fully open source."

✅ **New developer can:**
> "Clone the repo, read Installation.md, have the app running. Create a new module by copying the template. Understand the architecture from ADRs. Contribute a feature in 2 hours (write code, test, PR)."

✅ **Operations team can:**
> "Deploy a new version to staging, run E2E tests, hit approve button, deploy to prod with zero downtime. If something breaks, rollback via bash script."

✅ **Customer can:**
> "Self-serve 90% of questions via docs. For the hard 10%, contact support with exact error message from Runbook."

---

## Next Steps

1. **Confirm**: Do you accept this plan? Any changes?
2. **Allocate**: Assign team members to roles
3. **Kick off**: Week 1 starts Monday, DevOps engineer starts on Docker
4. **Track**: Weekly standup, bi-weekly demo, final sign-off Week 7

**Questions?** Ask now. Once Phase 1 starts, this brief is locked (changes via change request only).

---

**Document version**: 1.0  
**Prepared by**: Giovanni Venditto (CTO)  
**Approved by**: [pending]  
**Distribution**: Team + Stakeholders
