# Nagma Frontend

Frontend Next.js del gestionale Nagma Tattoo CRM.

## Stack

- Next.js `16.2.1` con App Router
- React `19.2.4`
- TypeScript `5`
- SWR per caching e server state
- Tailwind CSS `4`
- Recharts per dashboard
- `xlsx` per export file
- `react-hot-toast` per feedback utente

## Funzionalita principali

- dashboard a widget con `BentoCard`
- anagrafica clienti
- agenda settimanale
- spese / transazioni
- team e turni
- inventario / creme
- export `CSV`, `XLSX` e stampa `PDF`
- branding via `.env`
- WhatsApp manuale con template, anteprima, modifica testo e storico invii

## Struttura rilevante

```txt
frontend/src/
├── app/
│   ├── page.tsx
│   ├── login/
│   ├── clienti/
│   ├── agenda/
│   ├── spese/
│   ├── team/
│   ├── creams/
│   └── whatsapp/
├── api/
├── components/
├── config/
├── context/
├── hooks/
│   ├── domain/
│   └── useWhatsAppComposer.ts
├── services/
├── types/
└── utils/
```

## Avvio locale

### 1. Prerequisiti
- **Node.js**: consigliata versione >= 20. Usa `nvm use` se è presente un file `.nvmrc`.
- **Backend**: Il server backend deve essere attivo (default su `http://localhost:3001`).

### 2. Installazione
```bash
cd frontend
npm install
```

### 3. Sviluppo
```bash
npm run dev
```

App disponibile su `http://localhost:3000`.

## 🔑 Credenziali di Accesso Default
Se il database è stato popolato, puoi accedere come Admin:
- **Email:** `admin@nagma.it`
- **Password:** `admin123`


## Variabili ambiente

File: `frontend/.env`

```env
NEXT_PUBLIC_PORTAL_NAME=
NEXT_PUBLIC_PORTAL_SHORT_NAME=
NEXT_PUBLIC_PORTAL_DESCRIPTION=
NEXT_PUBLIC_PORTAL_LOGIN_TAGLINE=
NEXT_PUBLIC_PORTAL_LOGO=
```

## Qualita codice

```bash
cd frontend
npx tsc --noEmit
npm run lint
```

## Convenzioni architetturali

- niente barrel `index.ts`: import espliciti verso i file reali
- hook di dominio in `src/hooks/domain/`
- validazione frontend riallineata agli schema condivisi in `/schemas`
- permessi UI centralizzati in `src/utils/permissions.ts`
- export centralizzato in `src/utils/export.ts`
- stato `loading / empty / error` standardizzato con componenti di feedback condivisi
- composer WhatsApp condiviso tra pagina e modal per evitare duplicazioni

## Domini principali

### Dashboard

- widget separati e riusabili
- base comune tramite `BentoCard`
- grafici e KPI isolati in componenti dedicati

### CRUD e liste

- filtri e ricerca nelle pagine principali
- paginazione dove supportata dal backend
- hook SWR dedicati per ridurre fetch duplicati

### WhatsApp manuale

La sezione WhatsApp e volutamente manuale:

- nessun reminder automatico
- template con categoria, attivo/disattivo e duplicazione
- anteprima e modifica rapida del testo prima di aprire WhatsApp
- apertura `wa.me` dal browser
- storico invii registrato lato backend
- template consigliati per casi d'uso frequenti

## Stato attuale

Frontend allineato a:

- branding dinamico via env
- role-based UI permissions
- export filtrati
- validazione condivisa FE/BE
- logging backend con `requestId` usabile per debug FE/BE
