---
name: Architecture Analysis - Nagma CRM
description: Pattern architetturali, endpoint API, refactoring completato il 2026-04-07
type: project
---

## Pattern Architetturali

**Backend:** Three-tier MVC — Controller → Service → Repository
**Frontend:** App Router Next.js + Service layer + SWR + Context API (auth)

## Refactoring 2026-04-07 (completato)

- `AppError` class in `backend/src/utils/AppError.ts`
- Zod validators centralizzati in `backend/src/utils/validators.ts` con helper `validate()`
- Error format uniforme `{ message }` in tutti i controller
- CORS whitelist via `CORS_ORIGINS` env var
- Crash esplicito all'avvio se `JWT_SECRET` o `DATABASE_URL` mancanti
- `prisma.$transaction()` in `cream.service.ts` per atomicità
- Rimosso stub Outlook da `booking.service.ts`
- Enum condivisi frontend in `frontend/src/types/enums.ts`
- Interfacce TypeScript complete in `frontend/src/types/dashboard.ts` e `customer.ts`

## Issues Residui (priorità alta, da fare)

- Nessun rate limiting su `/api/auth/login` (brute force risk)
- Nessuna paginazione su `GET /api/customers` (tutti i record in una call)
- Test coverage: 0% (zero test files)
- JWT in cookie non httpOnly (XSS risk)
- Soft-delete non filtrato nelle relazioni include di `booking.repository.ts`

**Why:** Sessione di code cleanup pre-consegna (deadline 2026-04-27)
**How to apply:** Usare come riferimento per sapere cosa è già stato sistemato e cosa resta.
