---
name: Architecture Analysis - Nagma CRM
description: Stato architetturale aggiornato al 2026-04-09 dopo refactor frontend/backend, schemas condivisi, logging strutturato e flusso WhatsApp manuale
type: project
---

## Pattern Architetturali

**Backend:** `Controller -> Service -> Repository`  
**Frontend:** Next.js App Router + service layer + SWR + Context API  
**Shared validation:** `schemas/` condivisi tra frontend e backend

## Stato Reale del Progetto

### Backend

- `backend/src/app.ts` contiene composizione Express, middleware e global error handling
- `backend/src/index.ts` contiene bootstrap, validazione env, lifecycle server e restart controllato
- restart automatico dopo crash: `10s`
- `nodemon` configurato per sviluppo
- `AppError` centralizzato
- `validators.ts` basato su schema Zod condivisi
- logging strutturato con:
  - timestamp
  - livello
  - `requestId`
  - sanitizzazione campi sensibili
  - colori ANSI in sviluppo
  - `DEBUG_HTTP=true` per log estesi
- error payload uniforme con `requestId`

### Frontend

- branding centralizzato via `.env`
- barrel `index.ts` rimossi
- dashboard rifattorizzata in widget
- hook di dominio per fetch/cache
- export `CSV`, `XLSX`, `PDF`
- loading / empty / error state uniformati
- permessi UI centralizzati
- validazione frontend riallineata agli schema condivisi
- WhatsApp manuale con:
  - template
  - categoria
  - attivo/disattivo
  - duplicazione
  - anteprima
  - modifica rapida testo
  - storico invii
  - template consigliati
- logica composer WhatsApp condivisa tra pagina e modal

### Database / Prisma

- migration `20260409120000_whatsapp_manual` presente e applicata
- `WhatsAppTemplate` esteso con `category`, `isActive`, `updatedAt`
- `WhatsAppMessageLog` presente
- enum `WhatsAppMessageStatus` presente

## Refactor Completati

- separazione `app.ts` / `index.ts` nel backend
- logger strutturato backend
- error handling uniforme con `AppError`
- paginazione backend per `transactions`, `users`, `creams`
- servizi frontend riallineati ai payload paginati
- export centralizzato frontend
- permissions/toast/validation centralizzati frontend
- schemi condivisi root `schemas/`
- dominio WhatsApp manuale end-to-end
- composer WhatsApp condiviso e filtro template coerente

## Decisioni di Prodotto Importanti

- WhatsApp resta **manuale**
- niente reminder automatici
- niente scheduler
- niente campagne automatiche
- gli export restano disponibili dai dati filtrati visibili in pagina

## Stato Qualita

Verifiche gia passate nelle ultime sessioni:

- frontend: `tsc`, `eslint`
- backend: `tsc`, `build`
- prisma migration: allineata al database locale

## Backlog Prioritario Residuo

- test coverage ancora assente
- rate limiting su auth login assente
- `requestId` non ancora propagato nel frontend error handling/toast
- dettaglio cliente completo ancora da costruire
- agenda avanzata ancora migliorabile
- eventuale export backend dedicato per dataset molto grandi

## Nota per le prossime sessioni

Quando si tocca WhatsApp:

- riusare `useWhatsAppComposer`
- non duplicare la logica tra pagina e modal
- mantenere il flusso solo manuale

Quando si tocca logging backend:

- `DEBUG_HTTP` deve restare opt-in
- campi sensibili sempre sanitizzati
- mantenere `requestId` in log e risposte errore

Quando si tocca documentazione:

- tenere allineati `README.md`, `frontend/README.md`, `docs/architettura.md` e questo file memory
