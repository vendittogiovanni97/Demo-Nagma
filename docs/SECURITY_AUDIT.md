# Security Audit — OWASP Top 10

**Data**: 13 Luglio 2026
**Test automatizzati**: `backend/test/security/owasp-audit.test.ts` (21 test)

## A01: Broken Access Control
- [x] Endpoint protetti richiedono JWT (401 senza token)
- [x] Token JWT invalidi/malformati rifiutati
- [x] Rate limiting su login (5 tentativi/15min, `skipSuccessfulRequests`)
- [x] CORS whitelist in produzione (`nagma.it`, `www.nagma.it`)
- [x] Role-based access: `adminOnly`, `requireRoles` middleware
- [x] SUPER_ADMIN bypass su role check
- [x] Nessun 403 esposto (anti-enumerazione: sempre 404)
- [ ] Ownership check per-modulo (solo parziale)
- ⚠️ **Rischio**: JWT accettato anche da `req.query.token` — leak in log/referrer

## A02: Cryptographic Failures
- [x] Password hash bcrypt (salt rounds configurabili, default 10)
- [x] JWT_SECRET ≥ 32 char (validato al boot)
- [x] Password rimossa dalle risposte API (`sanitizeUser()`)
- [x] Health endpoint non espone connection string
- [ ] HTTPS/TLS (responsabilità reverse proxy)
- ⚠️ **Rischio medio**: password minima 6 char, no requisiti complessità

## A03: Injection
- [x] Prisma parametrizza tutte le query (zero SQL injection)
- [x] Raw query solo via `Prisma.sql` tagged template (sicuro)
- [x] Zero `$queryRawUnsafe` / `$executeRawUnsafe`
- [x] Injection NoSQL/JSON rifiutata
- [x] XSS payload in search non riflessi come HTML
- [x] Zero `eval()` o `Function()` nel codice

## A04: Insecure Design
- [x] Login non rivela se email esiste (anti-enumerazione)
- [x] Soft delete pattern su tutte le entità principali
- [x] Feature flag middleware per moduli opzionali
- ⚠️ **Rischio**: `apiRateLimiter` definito ma mai applicato globalmente
- ⚠️ **Rischio**: Zod validation mancante su booking create/update e transaction update

## A05: Security Misconfiguration
- [x] Helmet attivo (tutti i default + CORP cross-origin)
- [x] `X-Content-Type-Options: nosniff`
- [x] `X-Powered-By` rimosso
- [x] Route inesistenti → 404 senza stack trace
- [x] JSON malformato → 400
- [x] Payload oversize → rifiutato (≥ 400)
- [x] `.env` in `.gitignore`, non committato

## A06: Vulnerable Components
- [ ] `npm audit` regolare in CI
- [x] Node.js 24-alpine in Docker (minimal surface)

## A07: Identification & Authentication
- [x] JWT formato valido (3 segmenti base64)
- [x] Credenziali vuote rifiutate
- [x] JWT_SECRET placeholder detection al boot (warn se debole)
- [ ] Token revocation/blacklist (logout non invalida JWT)
- ⚠️ **Rischio**: algoritmo JWT non pinnato a HS256

## A08: Software & Data Integrity
- [x] Content-Type non-JSON rifiutato su endpoint JSON
- [x] Prisma schema alignment
- [ ] CSRF protection (rischio basso: Bearer token, no cookie auth)

## A09: Security Logging & Monitoring
- [x] Risposte errore con struttura consistente
- [x] Nessun internal leak (no stack trace, no `node_modules` path)
- [x] Logger configurabile via `LOG_LEVEL`
- [x] Rate limiter logga tentativi bloccati
- ⚠️ **Nota**: errore Prisma P2002 espone nomi campi unique constraint

## A10: SSRF
- [x] URL-like values in search param non innescano fetch server-side
- [x] Nessun user-controlled URL in operazioni fetch backend

## File Upload
- [x] Limite 10MB per file
- [x] MIME whitelist (jpeg, png, webp, gif, pdf, docx, xlsx, txt, csv)
- [x] Streaming via busboy (no buffer in memoria)
- ⚠️ **Rischio**: MIME basato su Content-Type client, no magic byte check
- ⚠️ **Rischio**: nessun limite numero file per request

---

**Test automatizzati**: 21/21 ✅
**Vulnerabilità critiche**: 1 (Zod validation mancante su booking CRUD)
**Vulnerabilità alte**: 3 (JWT in query string, no global rate limit, no token revocation)
**Vulnerabilità medie**: 4 (password debole, MIME spoofing, JWT algorithm, P2002 field leak)

**Runbook**: `npm audit` prima di ogni deploy. HTTPS via reverse proxy. Applicare `apiRateLimiter` globalmente. Aggiungere Zod schema a booking controller.
