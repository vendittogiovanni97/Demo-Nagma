# Nagma Tattoo CRM - Architettura

Aggiornato al `2026-04-09`.

## Panoramica

Il progetto e diviso in due applicazioni principali:

- `frontend/`: Next.js App Router
- `backend/`: Express + Prisma + PostgreSQL

In piu esiste `schemas/`, una cartella condivisa con validazione Zod e tipi riusati tra frontend e backend.

## Stack

| Area | Tecnologia |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, SWR, Tailwind 4 |
| Backend | Express 5, TypeScript 6, Prisma 6, PostgreSQL |
| Auth | JWT Bearer + bcryptjs |
| Export | CSV / XLSX / PDF print |
| Charts | Recharts |
| Validation | Zod + schema condivisi |

## Backend

### Pattern

Pattern principale:

`Controller -> Service -> Repository`

Responsabilita:

- `routes/`: wiring Express e permessi
- `controllers/`: parsing request/response
- `services/`: business logic
- `repositories/`: accesso Prisma
- `utils/`: logger, validators, AppError, async handler, prisma singleton

### Bootstrap e runtime

File chiave:

- [app.ts](/Users/giovannivenditto/Documents/Demo-Nagma/backend/src/app.ts): composizione Express, middleware, request logging, global error handler
- [index.ts](/Users/giovannivenditto/Documents/Demo-Nagma/backend/src/index.ts): bootstrap, validazione env, start/stop server, graceful shutdown, restart controllato

Comportamento runtime:

- `dotenv.config()` viene eseguito in fase di boot
- `npm run dev` usa `nodemon`
- in caso di crash il backend prova a riavviarsi dopo `10` secondi
- i segnali `SIGINT` e `SIGTERM` chiudono il server e Prisma in modo ordinato

### Logging

Il backend usa logging strutturato con:

- timestamp ISO
- livello (`INFO`, `WARN`, `ERROR`)
- `requestId`
- contesto request
- sanitizzazione campi sensibili
- colori ANSI in sviluppo

Flag:

- `DEBUG_HTTP=true` abilita logging HTTP esteso
- con `DEBUG_HTTP=false` il body non viene loggato

Obiettivo pratico:

- capire subito endpoint, durata, stato e contesto dell'errore
- incrociare facilmente frontend e backend tramite `requestId`

### Error handling

Errore applicativo standard:

- `AppError`
- payload uniforme
- `requestId` incluso nelle risposte errore

Shape tipica:

```json
{
  "success": false,
  "message": "Errore applicativo",
  "requestId": "uuid",
  "error": {
    "code": "APP_ERROR_CODE",
    "statusCode": 400,
    "details": []
  }
}
```

## Frontend

### Pattern

- App Router con pagine verticali per dominio
- SWR per fetch e caching
- service layer per accesso API
- `AuthContext` per sessione utente
- componenti e modali riusabili
- hook dedicati per ridurre fetch duplicati

### Branding

Branding e variabili portale sono centralizzati in:

- `frontend/.env`
- `frontend/src/config/branding.ts`

### Hook di dominio

Hook principali attualmente presenti:

- `useCustomers`
- `useBookings`
- `useTransactions`
- `useCreams`
- `useTeam`
- `useWhatsAppTemplates`
- `useWhatsAppLogs`
- `useWhatsAppComposer`

### Convenzioni rilevanti

- il frontend non usa piu barrel `index.ts`
- gli import sono espliciti
- export centralizzati in `src/utils/export.ts`
- permessi UI centralizzati in `src/utils/permissions.ts`
- stato `loading / empty / error` standardizzato

## Schemi condivisi

Cartella:

```txt
schemas/
```

Domini coperti:

- customer
- booking
- transaction
- cream
- user
- whatsapp

Obiettivo:

- validazione coerente FE/BE
- riduzione duplicazioni
- type safety migliore sui payload

## WhatsApp manuale

Scelta di prodotto:

- niente reminder automatici
- niente scheduler
- uso manuale con template

Flusso:

1. selezione template
2. precompilazione variabili
3. modifica rapida del testo
4. apertura WhatsApp Web
5. registrazione log invio

Elementi chiave:

- template con categoria
- attivo/disattivo
- duplicazione
- template consigliati
- storico invii
- composer condiviso tra pagina e modal

## Migrazioni Prisma

Migration rilevante:

- `backend/prisma/migrations/20260409120000_whatsapp_manual/`

Contiene:

- estensione `WhatsAppTemplate`
- tabella `WhatsAppMessageLog`
- enum `WhatsAppMessageStatus`

## Stato tecnico corrente

Gia consolidato:

- paginazione backend per `transactions`, `users`, `creams`
- export `CSV`, `XLSX`, `PDF`
- branding dinamico frontend
- permessi ruolo frontend/backend
- logging backend strutturato con `requestId`
- validazione condivisa tramite `schemas/`

## Note operative

- quando si modifica WhatsApp, riusare il composer condiviso
- quando si modifica logging backend, mantenere `DEBUG_HTTP` opt-in
- quando si modifica backend core, preservare la separazione tra `app.ts` e `index.ts`
