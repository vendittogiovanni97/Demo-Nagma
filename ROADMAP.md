# Roadmap Tecnica — Demo-Nagma

> Roadmap operativa a breve termine (1–3 mesi) su **sicurezza, stabilità, performance e architettura**.
> Basata su un assessment statico del codice sorgente. Ultimo aggiornamento: **2026-08-05**.

## Legenda

| Simbolo | Significato |
|---------|-------------|
| 🔴 | Gravità **critica / alta** — chiudere per primo |
| 🟠 | Gravità **media** |
| 🟢 | Gravità **bassa** / miglioramento |
| ✅ | Punto già presidiato (non richiede intervento) |

---

## Stato attuale (baseline)

Il progetto parte da fondamenta solide. Punti già presidiati:

- ✅ Architettura modulare feature-driven (17 moduli backend / 18 frontend), DI container, handler factory.
- ✅ Sicurezza di base: `helmet`, CORS a whitelist, rate-limiter (login/auth/api), bcrypt, validazione `JWT_SECRET` ≥32 al boot, suite di test OWASP.
- ✅ Dati: 22 modelli Prisma, 53 indici, soft-delete (`deletedAt`) su 34 campi, pattern N+1 sostanzialmente assenti.
- ✅ Qualità/osservabilità: CI attiva, error middleware globale, `requestId`, logger strutturato, `MetricsService`, warning su richieste lente.

**Metriche di riferimento:** backend ~8.614 LOC · frontend ~28.159 LOC · 24 file test backend + 15 frontend · 127 occorrenze di `any` (85 BE + 42 FE).

---

## Criticità aperte

| Gravità | Area | Rilievo | Evidenza |
|---------|------|---------|----------|
| 🔴 | Sicurezza | File `.env` di backend e frontend versionati in git con `JWT_SECRET` e `DATABASE_URL` in chiaro; manca la regola `.env` nel `.gitignore`. | `backend/.env`, `frontend/.env`, `.gitignore` |
| 🔴 | Sicurezza | Token JWT accettato anche via query-param (`?token=`): rischio leak in log/proxy/cronologia. | `core/middleware/auth.middleware.ts:48` |
| 🔴 | Architettura | Stack su versioni major molto recenti (Next 16, React 19, Prisma 7.8, TS 6, Express 5, Zod 4, MUI 9): breaking-change ed ecosistema immaturo. | `package.json` (BE + FE) |
| 🟠 | Stabilità | Nessun `coverageThreshold` in Jest: copertura non misurata né imposta come gate. | config Jest backend |
| 🟠 | Stabilità | Backend senza ESLint (nessun config né script `lint`); CI backend solo typecheck + test. | `backend/` |
| 🟠 | Stabilità | Due workflow CI sovrapposti (`ci.yml` + `test.yml`) sugli stessi eventi. | `.github/workflows/` |
| 🟠 | Sicurezza | Swagger `/api-docs` montato senza guardia `NODE_ENV`: esposto in produzione. | `src/app.ts:120` |
| 🟠 | Sicurezza | Password realistiche in chiaro nel seed JSON versionato. | `prisma/seed-data/nagma.json` |
| 🟠 | Performance | 127 occorrenze di `any`: perdita di type-safety, specie su moduli sensibili (auth, finance, booking). | `backend/src`, `frontend/src` |
| 🟠 | Performance | Dipendenze frontend pesanti (AG Grid, FullCalendar, Recharts, MUI) senza code-splitting mirato. | `frontend/src/modules` |
| 🟢 | Stabilità | `console.*` in 6 file BE + 7 FE invece del logger centralizzato. | `backend/src`, `frontend/src` |
| 🟢 | Stabilità | `try/catch` in un controller (attachment), in contrasto con la regola handler-factory. | `modules/attachment/controllers` |
| 🟢 | Architettura | Su 22 modelli Prisma un solo `@@unique` a livello di blocco: verificare copertura vincoli di unicità a livello DB. | `prisma/schema.prisma` |

---

## Milestone 1 — Mese 1: Sicurezza & igiene del repository

**Obiettivo:** eliminare i segreti dal versionamento e ridurre la superficie di attacco, senza modifiche funzionali visibili all'utente.

- [ ] Rimuovere i file `.env` dal tracking git, aggiungere la regola `.env` al `.gitignore`, mantenere solo i `.env.example`.
- [ ] Ruotare **tutti** i segreti esposti: `JWT_SECRET`, password del database, credenziali di seed usate in ambienti reali.
- [ ] Purgare i segreti dalla cronologia git (BFG / `git-filter-repo`) e forzare il re-clone del team.
- [ ] Rimuovere l'autenticazione via query-param `?token=`, o limitarla a URL firmati e a scadenza breve per i soli download.
- [ ] Aggiungere una guardia `NODE_ENV` su `/api-docs` (Swagger disabilitato o protetto in produzione).
- [ ] Consolidare i due workflow CI in un'unica pipeline coerente.

**Definizione di "fatto":**
- Nessun file `.env` in `git ls-files`; segreti storici rimossi dalla history.
- Segreti ruotati e distribuiti via variabili d'ambiente / secret manager.
- Swagger non raggiungibile in produzione; token accettato solo via header `Authorization`.
- Una sola pipeline CI verde su ogni PR.

---

## Milestone 2 — Mese 2: Qualità blindata & type-safety

**Obiettivo:** trasformare i controlli di qualità da "buona volontà" a gate obbligatori della pipeline.

- [ ] Introdurre ESLint sul backend (config condivisa con il frontend) e aggiungere lo step `lint` alla CI backend.
- [ ] Impostare `coverageThreshold` in Jest (es. 70% sui moduli core: auth, booking, finance) come gate bloccante.
- [ ] Avviare la riduzione mirata degli `any` partendo dai moduli sensibili, sfruttando i tipi inferiti da Zod (`z.infer`).
- [ ] Sostituire `console.*` con il logger centralizzato; rimuovere i `try/catch` residui nei controller a favore della handler factory.
- [ ] Attivare aggiornamenti automatici delle dipendenze (Dependabot / Renovate) e `npm audit` come step CI.

**Definizione di "fatto":**
- Lint backend + frontend obbligatori e verdi in CI.
- Soglia di copertura enforced; build rossa sotto target.
- Riduzione misurabile degli `any` nei moduli core (target −50% sui sensibili).
- Alert automatici su vulnerabilità delle dipendenze.

---

## Milestone 3 — Mese 3: Governance stack, performance & osservabilità

**Obiettivo:** ridurre il rischio dello stack bleeding-edge, ottimizzare il caricamento frontend e chiudere il cerchio sull'osservabilità.

- [ ] Definire una policy di governance delle versioni: pinnare le major, calendario di upgrade controllati, valutazione rischi per dipendenza.
- [ ] Introdurre code-splitting / lazy-load sui componenti pesanti (AG Grid, FullCalendar, Recharts) + analisi bundle (`next build` + bundle analyzer).
- [ ] Integrare error tracking in produzione (es. Sentry) e collegare `MetricsService` a una dashboard con alerting sulle richieste lente.
- [ ] Verificare i vincoli di unicità a livello DB e testare periodicamente il flusso di backup/restore.
- [ ] Aggiungere una soglia di regressione al load test k6 come check periodico.

**Definizione di "fatto":**
- Documento di policy versioni approvato; major pinnate.
- Riduzione misurabile del bundle iniziale e del first-load JS.
- Errori di produzione tracciati e notificati; dashboard metriche attiva.
- Backup/restore verificato con runbook documentato.

---

## Matrice di prioritizzazione

| Intervento | Impatto | Sforzo | Milestone |
|------------|:-------:|:------:|:---------:|
| Rimozione `.env` + rotazione segreti | Molto alto | Basso | 1 |
| Guardia Swagger + no token in query | Alto | Basso | 1 |
| Consolidamento CI | Medio | Basso | 1 |
| ESLint backend + gate lint | Alto | Basso | 2 |
| Coverage threshold in CI | Alto | Medio | 2 |
| Dependabot / `npm audit` | Alto | Basso | 2 |
| Riduzione `any` nei moduli core | Medio | Medio | 2 |
| Policy governance versioni | Alto | Medio | 3 |
| Code-splitting frontend | Medio | Medio | 3 |
| Error tracking + dashboard | Alto | Medio | 3 |
