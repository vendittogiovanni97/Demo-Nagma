# Security Audit — OWASP Top 10 Checklist

## A1: Broken Access Control
- [x] JWT auth con refresh token
- [x] Rate limiting su login (5 tentativi/15min)
- [x] CORS configurabile via env
- [ ] Ownership check su ogni endpoint (user vede solo propri dati)
- [ ] Role-based middleware per ADMIN/SUPER_ADMIN endpoints

## A2: Cryptographic Failures
- [x] Password hash con bcrypt (salt rounds=10)
- [x] JWT secret ≥ 32 char
- [ ] HTTPS/TLS in produzione
- [ ] Secret rotation policy

## A3: Injection
- [x] Prisma parameterizza automaticamente le query
- [x] Zod validation su tutti gli input
- [x] No raw SQL queries
- [ ] Sanitize output in frontend (XSS prevention)

## A4: Insecure Design
- [x] Soft delete pattern (data privacy compliance)
- [x] Rate limiting on API endpoints
- [x] Feature flag middleware (optional)
- [ ] Rate limiting per-endpoint (non solo login)

## A5: Security Misconfiguration
- [x] CORS config via env
- [x] Debug mode disabilitabile via env
- [x] Error handling centralizzato (no stack trace leak)
- [x] .env in .gitignore
- [ ] CORS restrict to specific origins in production

## A6: Vulnerable Components
- [ ] Regular npm audit in CI
- [ ] Node.js version pinned (24-alpine in Docker)
- [ ] Alpine base image (minimal attack surface)

## A7: Auth Failures
- [x] JWT in httpOnly cookie
- [x] Refresh token rotation
- [x] Password hashing
- [ ] Account lockout after failed attempts
- [ ] Session timeout configuration

## A8: Data Integrity Failures
- [x] Prisma schema alignment
- [x] Zod validation on create/update
- [ ] CSRF protection on state-changing endpoints
- [ ] Signed download URLs for attachments

## A9: Logging & Monitoring
- [x] Logger configurable (LOG_LEVEL env)
- [ ] Audit log for sensitive operations
- [ ] Failed login attempts logging
- [ ] Alerting on error rate spikes

## A10: SSRF
- [ ] No user-controlled URLs in fetch operations
- [ ] No open redirect vulnerabilities

---

**Status**: 18/37 check ✅  
**Runbook**: `npm audit` before every deploy. Enable HTTPS in production reverse proxy.
