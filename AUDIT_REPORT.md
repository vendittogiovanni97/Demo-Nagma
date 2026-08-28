# 🔍 Audit Tecnico Senior — Demo-Nagma

**Data:** 28/08/2026 · **Commit:** `ba90231` · **Versione:** 0.0.3

---

## 📊 Executive Summary

| Area | Esito | Note |
|---|---|---|
| Compilazione TypeScript (backend) | ✅ | 0 errori |
| Compilazione TypeScript (frontend) | ✅ | 0 errori |
| Test unitari backend | ✅ | 169/169 passano (20 suite) |
| Test unitari frontend | ✅ | 66/66 passano (14 suite) |
| Architettura | ✅ | Modulare, coerente, DI container |
| Sicurezza | ⚠️ | Buona base, ma 3 criticità (vedi sotto) |
| Tipizzazione | ⚠️ | 87 usi di `any` nel backend |
| Design System | ⚠️ | 61 violazioni colori hardcoded |
| Debts tecnici | ⚠️ | God class booking, race condition conflitti |

**Valutazione complessiva: 7.5/10** — Progetto maturo e ben strutturato, con fondamenta solide (test, error handling, osservabilità, backup). Le criticità sono localizzate e correggibili.

---

## ✅ Punti di Forza

1. **Architettura modulare uniforme** — Ogni modulo backend segue il pattern `types/ → services/ → controllers/ → routes/ → bootstrap.ts`; il frontend separa `api/ → hooks/ → components/ → pages/`. Eccellente coerenza.
2. **Sicurezza consapevole** — `helmet`, CORS whitelist, rate limiting multi-livello, validazione JWT_SECRET (32+ char) al boot, Swagger disabilitato in produzione, token via query-param limitato a una sola rotta, path traversal prevention negli upload (UUID naming + blacklist estensioni).
3. **Error handling centralizzato** — `globalErrorHandler` distingue `AppError`, errori Prisma (P2002/P2025/P2003/P2000), JSON malformati e fallback 500 senza leak di stack trace. `requestId` propagato ovunque.
4. **Osservabilità** — Logging strutturato con livelli, `sanitizeForLog`, slow-request alerting (>1s warn, >5s error), Sentry opzionale, metriche per richiesta.
5. **Resilienza** — Graceful shutdown (SIGINT/SIGTERM), auto-restart con delay, health check DB, backup automatico con retention e invio email.
6. **Test** — Suite unit solida, integration test, test di sicurezza OWASP dedicati, load test k6, E2E Playwright.
7. **Soft delete consistente** — `deletedAt: null` applicato in tutte le query di lettura, indici dedicati.
8. **Storico/audit trail** — `BookingHistory` e `TransactionHistory` tracciano ogni modifica con utente e timestamp.

---

## 🔴 Criticità Alte (da fixare prima del rilascio)

### H1. Race condition (TOCTOU) nel controllo conflitti booking
In `bookingService.ts` (`create` e `update`) il controllo di sovrapposizione usa `$queryRaw` **fuori** dalla transazione che crea il booking:
```ts
const conflictRows = await prisma.$queryRaw(...);  // check
// ...poi, separatamente:
const result = await prisma.$transaction(async (tx) => { ... create ... });
```
Due richieste concorrenti per lo stesso artista/ora possono entrambe passare il check e creare doppie prenotazioni.
**Fix:** spostare il check dentro la transazione con `SELECT ... FOR UPDATE` sulla riga artista, oppure aggiungere un constraint di esclusione (`EXCLUDE USING gist`) su PostgreSQL con range `tsrange`.

### H2. ✅ RISOLTO — Transazioni finanziarie fuori dalla transazione Prisma in `updateKanbanStatus`
**Stato:** Fixato il 28/08/2026.

**Prima:** in `updateKanbanStatus` l'update del booking, la `bookingHistory` e la transazione "Saldo" erano tre operazioni separate e non atomiche: un crash a metà poteva lasciare un booking `COMPLETATO` senza incasso registrato. Inoltre mancava `financeCache.clear()`.

**Modifiche applicate** (`backend/src/modules/booking/services/bookingService.ts`):
- Estratto metodo privato **`handleCompletionTransactions(tx, booking)`**: logica finanziaria di completamento condivisa (saldo/incasso + compenso artista, con check `isRentPayee` e dedup della transazione "Saldo" per idempotenza).
- **`updateKanbanStatus`** ora esegue tutto dentro `prisma.$transaction`: update booking + `bookingHistory` + transazioni finanziarie atomiche; aggiunto `financeCache.clear()` dopo il commit.
- **`update()`** usa lo stesso metodo condiviso al posto del blocco inline duplicato: un'unica fonte di verità per la logica di completamento.

**Test aggiornati/aggiunti** (`backend/test/modules/booking/BookingService.test.ts`):
- Il test kanban esistente verifica ora che la history sia scritta nella transazione.
- Nuovo test: il saldo viene creato **dentro la transazione** (tx) e non sul prisma globale.
- Nuovo test: nessun duplicato del saldo quando il booking è già `COMPLETATO`.

**Verifiche:** `tsc --noEmit` ✅ (exit 0) · 169/169 test unit ✅ (+2 nuovi)

### H3. ✅ RISOLTO — Rate limiter login con bypass enumerabile
**Stato:** Fixato il 28/08/2026.

**Prima:** `loginRateLimiter` conteneva `skip: (req) => req.body?.email === 'superadmin@nagma.it' || ...`: l'email dell'account admin era hardcoded nel codice (enumerabile) e quell'account era brute-forzabile senza limiti.

**Modifiche applicate:**
- `backend/src/core/middleware/rateLimiter.ts` — rimosso lo `skip` basato su email; aggiunto `loginIpRateLimiter` (limite per-IP anti email-rotation, default 20 tentativi falliti/finestra, configurabile via `LOGIN_IP_RATE_LIMIT_MAX_ATTEMPTS`).
- `backend/src/core/config/env.ts` — nuova config `loginIpRateLimitMaxAttempts`.
- `backend/src/modules/auth/routes/auth.routes.ts` — login protetto da doppio limite: `loginIpRateLimiter` (per-IP) + `loginRateLimiter` (per-account email).
- `backend/.env.example` — variabili rate limiting documentate.

**Comportamento risultante:** nessun account è esente dal limite; brute-force su singolo account bloccato a 5 tentativi falliti; email-rotation dallo stesso IP bloccata a 20 tentativi falliti; i login riusciti non consumano budget (`skipSuccessfulRequests`).

**Verifiche:** `tsc --noEmit` ✅ · 167/167 test unit ✅

### H4. ✅ RISOLTO — Credenziali di default commesse nel codice
**Stato:** Fixato il 28/08/2026.

**Prima:** `docker-compose.db.yml` conteneva `POSTGRES_USER: root / POSTGRES_PASSWORD: root123` e `prisma.ts` aveva un fallback `postgresql://root:root123@localhost:5433/nagmadb` che poteva mascherare un `DATABASE_URL` mancante in produzione.

**Modifiche applicate:**
- `backend/src/core/shared/utils/prisma.ts` — rimosso il fallback: `requireDatabaseUrl()` fa throw con messaggio d'aiuto se `DATABASE_URL` manca (fail-fast).
- `infrastructure/docker/docker-compose.db.yml` — credenziali parametrizzate: `POSTGRES_USER`/`POSTGRES_PASSWORD` obbligatori (`${VAR:?msg}`), `POSTGRES_DB`/`POSTGRES_PORT` con default innocui.
- `.env.example` (radice, nuovo) — template per le variabili Docker.
- `backend/.env.example` — nota di coerenza tra `DATABASE_URL` e variabili compose.
- `backend/test/setup/loadEnv.ts` — fallback test-safe per `DATABASE_URL` (solo processo Jest, DB inesistente).
- `backend/jest.config.js` — `loadEnv.ts` collegato anche al progetto unit.
- `.env` radice locale creato (gitignored) con le credenziali del volume esistente.

**Verifiche:** `tsc --noEmit` ✅ · 167/167 test unit ✅ · `docker compose config` valida ✅ · `.env` gitignored ✅

---

## 🟠 Criticità Medie

### M1. God Class `BookingService` (779 righe)
Mescola: query/lista, statistiche, kanban, logica finanziaria (acconti, rimborsi, compensi), storico. La logica finanziaria è duplicata in 3 punti (`create`, `update`, `updateKanbanStatus`) con leggere divergenze già visibili (es. dedup della transazione solo in kanban).
**Fix:** estrarre `BookingFinancialService` (acconti/saldi/compensi/rimborsi) e `BookingConflictChecker`; unificare la creazione transazioni in un solo percorso.

### M2. Token JWT in cookie non-httpOnly
`auth.ts` usa `js-cookie`: il token è leggibile da JS → un XSS ne ruba la sessione. Mitigazioni attuali (sameSite strict, secure in prod) sono buone ma parziali.
**Fix ideale:** cookie httpOnly + endpoint di refresh server-side; oppure almeno valutare CSP restrittiva in `next.config.ts`.

### M3. ✅ RISOLTO — Refresh token = re-sign, nessuna revocation
**Stato:** Fixato e verificato il 28/08/2026. `tokenVersion Int @default(0)` su `User`, inclusa nel payload JWT (`authService.ts:22,135`), verificata in `auth.middleware.ts:113-116`, incrementata al cambio password in `authService.ts:122` e `staffService.ts:247`. Verifica post-fix: la migration SQL era mancante (bloccante in deploy con `prisma migrate deploy` — la colonna non sarebbe stata creata e il middleware auth sarebbe crashato); aggiunta `backend/prisma/migrations/20260828115200_add_user_token_version/migration.sql`.
**Descrizione originale:** `refreshToken` rilascia un nuovo JWT senza verificare lo stato reale dell'utente oltre a `deletedAt`. Dopo un cambio password o disattivazione, i token esistenti restano validi fino a scadenza (7 giorni default).
**Fix:** aggiungere `tokenVersion` sull'utente (incrementata al cambio password) inclusa nel payload JWT e verificata in `authMiddleware`.

### M4. ✅ RISOLTO — Bug potenziale di timezone nel form booking (frontend)
**Stato:** Fixato e verificato il 28/08/2026. In `useBookingForm.ts:368-369` si usa ora `format(d, 'yyyy-MM-dd')` e `format(d, 'HH:mm')` (date-fns, ora locale) per data e ora; il salvataggio (L205) converte correttamente da locale a UTC ISO.
**Descrizione originale:** in `useBookingForm.ts` la data era estratta in UTC (`toISOString`) e l'ora in locale: per prenotazioni vicine a mezzanotte la data mostrata era il giorno prima rispetto all'ora.
**Fix:** usare `date-fns` (`format(d, 'yyyy-MM-dd')` e `format(d, 'HH:mm')`) in locale per entrambi.

### M5. ✅ RISOLTO — `delete()`/`annul()` non filtrano `deletedAt`
**Stato:** Fixato e verificato il 28/08/2026. Il controllo `if (!oldBooking || oldBooking.deletedAt) → 404` è presente in `bookingService.update` (L340), `delete` (L474), `annul` (L512) e `updateKanbanStatus` (L727).
**Descrizione originale:** `bookingService.delete` e `annul` fanno `findUnique({ where: { id } })` senza `deletedAt: null`: è possibile modificare lo stato di un booking già soft-deleted.
**Fix:** aggiungere il filtro e restituire 404 se assente.

### M6. ✅ RISOLTO — 0 usi di `any` nel backend (da 87)
**Stato:** Completato e verificato il 28/08/2026: 87 → **0**. I service sono ora tipizzati con i tipi inferati dagli schemi Zod e gli enum Prisma (`TransactionType`, `BookingStatus`, `WhatsAppMessageStatus`, `Role`, `ThemeMode`); le colonne `Json` usano `Prisma.InputJsonValue` con mapper espliciti (`savedViewService.toDto`, `toJsonInput` in `transactionService`); il `Request` Express è stato esteso via declaration merging (`types/express.d.ts`) per `features`/`featureEnabled`; il container DI usa `new (...args: never[]) => T`. Restano solo 2 soppressioni documentate e volute in `core/utils/handler.ts` (vincolo generico per il passthrough del body HTTP non validato, nei route handler senza schema Zod). Verifiche: `tsc --noEmit` OK, ESLint `no-explicit-any` = 0, test unitari 20/20 suite e 169/169 test superati.
**Descrizione originale:** concentrati in `bookingService`, `transactionService`, `whatsappService`, `savedViewService`, `staffService`. I DTO Zod esistono ma i service accettano `data: any`, annullando il beneficio a valle.
**Fix:** tipizzare le firme dei service con i tipi inferati dagli schema Zod (`z.infer<typeof schema>`).

### M7. ✅ RISOLTO — 0 violazioni colori hardcoded nel frontend (da 61)
**Stato:** Completato e verificato il 28/08/2026: 61 → **0** (verifica `grep #hex|rgba` fuori da `common/theme`). Approccio a due livelli:
- **Colori-stile** (overlay, ombre, bordi, sfondi) → token MUI via `alpha(theme.palette.*)` o `theme.palette.*`: `not-found`, `LoginPage`, `AttachmentPreviewModal`, `KanbanCard`/`KanbanBoard` (ombre), `AgendaCalendar` (`primary.contrastText`), `ShiftModal`, `StaffPage`, `StaffModal` (`drop-shadow`), `Icon` (glow), `useCalendarEvents` (`textColor` da tema).
- **Colori-dato** (fallback colore artista, preset colori staff, colori stadi kanban, colori variabili WhatsApp, default brand config, meta theme-color browser) → centralizzati nel nuovo **`frontend/src/common/theme/colorTokens.ts`** (single source of truth, fuori dalla lista violazioni), eliminando anche 3 fallback di colore artista incoerenti (`#1976d2`/`#000000`/`#00BFFF` unificati in `DEFAULT_ARTIST_COLOR`).
- Bonus coerenza: `useClientConfig.DEFAULT_CLIENT_CONFIG` è allineato ai default brand del tema (`#1976d2`/`#dc004e` → `#00bfff`/`#1a2332`).
Verifiche: `tsc --noEmit` frontend OK, test unitari 14/14 suite e 66/66 test superati, `git diff --check` OK.
**Descrizione originale:** `rgba(...)`, `#ffffff`, `#1976d2` sparsi — viola la regola AGENTS.md "nessun colore hardcoded". Rischio: temi light/dark incoerenti e rebranding costoso.
**Fix:** centralizzare in `theme/` (token `alpha(theme.palette.x, n)`), prioritizzando i componenti in `common/`.

---

## 🟡 Criticità Basse / Miglioramenti

1. ✅ Duplicazione `httpClient`/`apiClient` — rimosso `httpClient` (identico e inutilizzato), resta solo `apiClient`.
2. ✅ Container DI minimale — scelta documentata in `backend/src/core/container/index.ts` (nessun lifecycle/scoped, bootstrap esplicito; note per evoluzione futura).
3. ✅ `EXPORT_FETCH_LIMIT` per caricare tutti i clienti — sostituito con autocomplete server-side: nuova hook `useCustomerAutocomplete` (SWR, debounce 300ms, min 2 caratteri, limite 25) + `onSearchChange` su `FormAutocomplete`; mantenuta visibile l'opzione selezionata (pinned).
4. ✅ `handleArtistLoad` con guard `artists.length > 1` — sostituito con `useStaffForSelect({ enabled })` (SWR con chiave dedicata); rimossi stato imperativo e guard fragile.
5. **Email unique globale + soft delete** — un utente soft-deleted blocca permanentemente la sua email; considerare unique parziale (`WHERE deleted_at IS NULL`).
6. **`apiRateLimiter` definito ma non montato globalmente** — verificare se è intenzionale applicarlo solo ad alcune rotte.
7. **Dipendenze bleeding-edge** — Next 16, React 19.2, MUI 9, TS 6, Prisma 7.8: aggiornamenti frequenti richiedono disciplina; `swagger-jsdoc` v6 è datato (valutare la rimozione se la spec è generata da zod-to-openapi).
8. **`uuid` v9** — esiste v11; `@types/uuid` v10 disallineato.
9. **`config.jwtExpiry as any`** — il cast è già copiato da `env.ts` (`as StringValue`); rimuovere il doppio cast.
10. **E2E coverage** — un solo `happy-path.spec.ts`; aggiungere scenari per login fallito, conflitto orari e permessi.
11. **`verifyPassword` con hash-on-read** — la migrazione lazy del password non è atomica; race benigna ma da documentare.
12. **CORS: `!origin` consentito** — accettabile per healthcheck/curl, ma documentare che le API sono raggiungibili da client non-browser.

---

## 🗄️ Schema Prisma — Osservazioni

- ✅ Indici ben pensati (compositi su `status+date`, `artistId+date`, `deletedAt` ovunque).
- ✅ Enum dominio corretti (`StaffType` limitato a COLLABORATORE/APPRENDISTA come da contratto).
- ⚠️ `Transaction.sourceId/sourceType` come `Int?/String?` — polimorfismo implicito senza integrità referenziale; un `ON DELETE` orfano non è prevenibile dal DB. Accettabile, ma centralizzare la creazione/cancellazione (vedi M1).
- ⚠️ `ClientConfig` senza multi-tenant reale (nessun `clientId` sulle entità) — se il multi-tenant è nel roadmap, serve una strategia ora.
- ⚠️ `FormTemplate.schemaB64` — schema in base64 in colonna `String`; valutare `Json` per query/filter future.

---

## 🧪 Verifiche Eseguite

```bash
cd backend  && npx tsc --noEmit   # ✅ 0 errori
cd frontend && npx tsc --noEmit   # ✅ 0 errori
cd backend  && npm run test:unit  # ✅ 167/167 (20 suite)
cd frontend && npm run test:unit -- --runInBand  # ✅ 66/66 (14 suite)
git check-ignore backend/.env     # ✅ .env non tracciati
```

---

## 📋 Piano di Azione Consigliato (priorità)

| # | Azione | Sforzo | Impatto |
|---|---|---|---|
| 1 | ~~Fix H3 (bypass rate limiter)~~ | ✅ **Completato** | Sicurezza |
| 2 | ~~Fix H4 (credenziali default)~~ | ✅ **Completato** | Sicurezza |
| 3 | ~~Fix M4 (timezone form booking)~~ | ✅ **Completato** | Correttezza dati |
| 4 | Fix H1 (race condition conflitti) | 3-4 h | Integrità dati |
| 5 | ~~Fix H2 (transazioni finanziarie atomiche)~~ | ✅ **Completato** | Integrità dati |
| 6 | ✅ M3 (tokenVersion/revocation) | completato + migration aggiunta | Sicurezza |
| 7 | ✅ M5 (deletedAt su delete/annul) | completato | Correttezza |
| 8 | ✅ M6 (tipizzazione service, a moduli) | completato (0/87 residui) | Manutenibilità |
| 9 | ✅ M7 (token tema, a componenti) | completato (0/61 residui) | Design system |
| 10 | M2 (cookie httpOnly) | 1 gg | Sicurezza |

---

*Audit condotto su: configurazioni, schema Prisma, middleware di sicurezza, moduli auth/booking/attachment, container DI, client API frontend, hook form booking, test suite e git hygiene.*
