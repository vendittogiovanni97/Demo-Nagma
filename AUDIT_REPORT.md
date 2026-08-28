# 🔍 Audit Tecnico Senior — Demo-Nagma

**Data:** 28/08/2026 · **Commit:** `ba90231` · **Versione:** 0.0.3

---

## 📊 Executive Summary

| Area | Esito | Note |
|---|---|---|
| Compilazione TypeScript (backend) | ✅ | 0 errori |
| Compilazione TypeScript (frontend) | ✅ | 0 errori |
| Test unitari backend | ✅ | 167/167 passano (20 suite) |
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

### H2. Transazioni finanziarie fuori dalla transazione Prisma in `updateKanbanStatus`
In `updateKanbanStatus` (righe ~721-766) la creazione della transazione "Saldo" avviene **dopo** e **fuori** da `prisma.$transaction`: un crash a metà lascia booking `COMPLETATO` senza incasso registrato. Inoltre non viene creato il `BookingHistory` con `action` coerente in tutti i rami e manca l'invalidazione di `financeCache.clear()` in questo metodo (presente invece in tutti gli altri).
**Fix:** unificare la logica di completamento con quella di `update()` in un unico metodo transazionale privato.

### H3. Rate limiter login con bypass enumerabile
```ts
skip: (req) => req.body?.email === 'superadmin@nagma.it' || req.user?.role === 'SUPER_ADMIN'
```
- Espone pubblicamente l'indirizzo dell'account amministratore (hardcoded nel codice).
- Un attaccante può fare brute-force **solo su quell'account** senza limiti.
**Fix:** rimuovere lo skip basato su email; per il SUPER_ADMIN usare esclusivamente `req.user?.role` (disponibile solo dopo autenticazione, quindi inefficace su `/login` — va comunque rimosso l'email check).

### H4. Credenziali di default commesse nel codice
- `docker-compose.db.yml`: `POSTGRES_USER: root / POSTGRES_PASSWORD: root123`
- `prisma.ts`: fallback `postgresql://root:root123@localhost:5433/nagmadb`

Anche se per sviluppo locale, il fallback in `prisma.ts` può mascherare un `DATABASE_URL` mancante **in produzione** connettendosi silenziosamente con credenziali note.
**Fix:** rimuovere il fallback (throw se manca `DATABASE_URL`), usare `.env` + variabili nel compose.

---

## 🟠 Criticità Medie

### M1. God Class `BookingService` (779 righe)
Mescola: query/lista, statistiche, kanban, logica finanziaria (acconti, rimborsi, compensi), storico. La logica finanziaria è duplicata in 3 punti (`create`, `update`, `updateKanbanStatus`) con leggere divergenze già visibili (es. dedup della transazione solo in kanban).
**Fix:** estrarre `BookingFinancialService` (acconti/saldi/compensi/rimborsi) e `BookingConflictChecker`; unificare la creazione transazioni in un solo percorso.

### M2. Token JWT in cookie non-httpOnly
`auth.ts` usa `js-cookie`: il token è leggibile da JS → un XSS ne ruba la sessione. Mitigazioni attuali (sameSite strict, secure in prod) sono buone ma parziali.
**Fix ideale:** cookie httpOnly + endpoint di refresh server-side; oppure almeno valutare CSP restrittiva in `next.config.ts`.

### M3. Refresh token = re-sign, nessuna revocation
`refreshToken` rilascia un nuovo JWT senza verificare lo stato reale dell'utente oltre a `deletedAt`. Dopo un cambio password o disattivazione, i token esistenti restano validi fino a scadenza (7 giorni default).
**Fix:** aggiungere `tokenVersion` sull'utente (incrementata al cambio password) inclusa nel payload JWT e verificata in `authMiddleware`.

### M4. Bug potenziale di timezone nel form booking (frontend)
In `useBookingForm.ts`:
```ts
date: d.toISOString().split('T')[0],   // UTC
time: d.toTimeString().slice(0, 5),    // ora locale
```
Per prenotazioni vicine a mezzanotte (es. 00:30 locali in UTC+2) la data mostrata è **il giorno prima** rispetto all'ora. Il round-trip al salvataggio (`new Date(\`${date}T${time}\`)`) può spostare la prenotazione di un giorno.
**Fix:** usare `date-fns` (`format(d, 'yyyy-MM-dd')` e `format(d, 'HH:mm')`) in locale per entrambi.

### M5. `delete()`/`annul()` non filtrano `deletedAt`
`bookingService.delete` e `annul` fanno `findUnique({ where: { id } })` senza `deletedAt: null`: è possibile modificare lo stato di un booking già soft-deleted.
**Fix:** aggiungere il filtro e restituire 404 se assente.

### M6. 87 usi di `any` nel backend
Concentrati in `bookingService`, `transactionService`, `whatsappService`, `savedViewService`, `staffService`. I DTO Zod esistono ma i service accettano `data: any`, annullando il beneficio a valle.
**Fix:** tipizzare le firme dei service con i tipi inferati dagli schema Zod (`z.infer<typeof schema>`), iniziando da booking e finance.

### M7. 61 violazioni colori hardcoded nel frontend
`rgba(...)`, `#ffffff`, `#1976d2` sparsi in `ToastContainer`, `Card`, `Navbar`, `FormAutocomplete`, `AttachmentPreviewModal`, ecc. — viola la regola AGENTS.md "nessun colore hardcoded". Rischio: temi light/dark incoerenti e rebranding costoso.
**Fix:** centralizzare in `theme/` (token `alpha(theme.palette.x, n)`), prioritizzando i componenti in `common/`.

---

## 🟡 Criticità Basse / Miglioramenti

1. **Duplicazione `httpClient`/`apiClient`** in `client.ts` — due export identici; mantenerne uno.
2. **Container DI minimale** — nessun singleton/lifecycle/scoped resolution; per la scala attuale è accettabile, ma documentare la scelta.
3. **`EXPORT_FETCH_LIMIT` per caricare tutti i clienti** nel form booking — degraderà con migliaia di clienti; prevedere autocomplete server-side.
4. **`handleArtistLoad` con guard `artists.length > 1`** — logica di cache fragile; preferire SWR con chiave dedicata.
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
| 1 | Fix H3 (bypass rate limiter) | 15 min | Sicurezza |
| 2 | Fix H4 (credenziali default) | 30 min | Sicurezza |
| 3 | Fix M4 (timezone form booking) | 1 h | Correttezza dati |
| 4 | Fix H1 (race condition conflitti) | 3-4 h | Integrità dati |
| 5 | Fix H2 + M1 (refactor finanziario transazionale) | 1-2 gg | Integrità dati |
| 6 | M3 (tokenVersion/revocation) | 3 h | Sicurezza |
| 7 | M5 (deletedAt su delete/annul) | 30 min | Correttezza |
| 8 | M6 (tipizzazione service, a moduli) | progressivo | Manutenibilità |
| 9 | M7 (token tema, a componenti) | progressivo | Design system |
| 10 | M2 (cookie httpOnly) | 1 gg | Sicurezza |

---

*Audit condotto su: configurazioni, schema Prisma, middleware di sicurezza, moduli auth/booking/attachment, container DI, client API frontend, hook form booking, test suite e git hygiene.*
