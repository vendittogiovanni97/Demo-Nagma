# AGENTS.md — Linee Guida Operative per Agent AI (Demo-Nagma)

Questo file definisce i principi, le regole tecniche e la struttura da seguire per ogni modifica o sviluppo sulla codebase di **Demo-Nagma**.

---

## 📌 Regole Generali & Comunicazione

1. **Lingua Ufficiale:** Rispondi e documenta sempre in **Italiano**.
2. **Sintesi ed Efficienza:** Mantieni le spiegazioni concise e focalizzate sulle modifiche eseguite.
3. **Nessuna Ipotesi:** Ispeziona sempre i file ed i tipi reali con i tool prima di scrivere codice.

---

## 🛠️ Stack Tecnologico & Convenzioni

| Layer | Tecnologie |
|---|---|
| **Backend** | Node.js 22+, Express 5, Prisma 7.8 (PostgreSQL 17), Zod 4, JWT, ExcelJS, PDFKit |
| **Frontend** | Next.js 16 (App Router), React 19, Material-UI 9, AG-Grid, SWR, Lucide-React |
| **Testing** | Jest (Backend unit/integration e Frontend unit), Playwright (Frontend E2E) |

---

## 🏛️ Architettura dei Moduli

### Backend (`backend/src/modules/[nome_modulo]/`)
Ogni modulo deve contenere la seguente struttura uniforme:
- `types/`: DTO e validazioni Zod.
- `services/`: Logica di business e query Prisma (usare sempre soft delete `deletedAt: null`).
- `controllers/`: Handler Express con gestione degli errori unificata.
- `routes/`: Rotte Express registrate in `routes.ts`.
- `[nome_modulo].bootstrap.ts`: Registrazione delle istanze nel container DI (`core/container/bootstrap.ts`).

### Frontend (`frontend/src/`)
- `modules/[nome_modulo]/api/`: Client API HTTP che fa uso del client centralizzato `apiClient`.
- `modules/[nome_modulo]/hooks/`: Custom Hook React con SWR o gestione stato locale.
- `modules/[nome_modulo]/components/`: Componenti riutilizzabili.
- `app/[nome_modulo]/page.tsx`: Pagina Next.js App Router.

---

## 🎨 UI/UX & Design System

1. **Nessun Colore Hardcoded:** Mai usare esadecimali (es. `#1976d2`), `rgba()` o stringhe colore inline in props `sx`. Utilizzare esclusivamente i token del tema MUI (`theme.palette.primary.main`, `theme.palette.background.default`, `text.secondary`, ecc.).
2. **Design Responsive & Mobile:**
   - Prevedere la navigazione via `MobileDrawer` su schermi stretti (`isSmall` / `isMedium`).
   - Assicurare un'area di tocco minima di **44px** per pulsanti e controlli su mobile (`minWidth: 44, minHeight: 44`).
   - Abilitare `WebkitOverflowScrolling: 'touch'` per lo scorrimento delle tabelle.
3. **Gestione Errori e Feedback:** Utilizzare sempre `useToast()` per notifiche di successo, errore e caricamento. Mai spargere messaggi d'errore grezzi in `useState` non gestiti.

---

## 🔄 Paginazione ed Esportazione Standardizzate

- **Paginazione:** Tutte le API di lista devono restituire il formato unificato `{ data, total, page, limit, pages, totalPages }`. Nel frontend utilizzare il limite salvato in `localStorage` (`nagma_items_per_page`, default `25`) ed eseguire lo scroll-to-top al cambio pagina.
- **Esportazione:** Utilizzare il modulo generico `/api/export` per esportazioni in CSV (UTF-8 BOM), Excel (.xlsx con stili via ExcelJS) e PDF (via PDFKit).

---

## 🧩 Componenti Condivisi Correnti

- **Tabelle:** usare `DataTable` e colonne responsive tramite `flex`/`minWidth`; non assegnare larghezze rigide alle colonne applicative.
- **Azioni tabella:** le pagine dichiarano `TableAction[]` tramite `rowActions`; rendering, colori, tooltip, permessi e loading sono gestiti da `TableActions` con `Button variant="icon"`.
- **AG Grid:** controllare il caricamento esclusivamente con la prop `loading`; non usare `showLoadingOverlay()`, `showNoRowsOverlay()` o `hideOverlay()`.
- **Form:** usare `FormInput`, `FormSelect`, `TextareaInput` e `CheckboxInput`. Le textarea controllate devono preservare le righe vuote durante la digitazione e normalizzarle al salvataggio.
- **Export frontend:** utilizzare `ExportModal` e il client centralizzato in `common/shared/api/export.api.ts`; non ricreare client o modali di esportazione nei moduli.
- **Filtri data:** utilizzare `useDateRangeFilters` per i range condivisi.
- **Dashboard appuntamenti:** il widget mostra al massimo 5 prenotazioni operative (`CREATO`, `CONFERMATO`) e rimuove quelle iniziate da più di 10 minuti.

## 🔐 Contratti di Dominio

- `StaffType` accetta esclusivamente `COLLABORATORE` e `APPRENDISTA` in frontend, Zod backend e Prisma.
- Una modale CRUD deve ricevere l'entità selezionata: la modalità modifica usa `update(id, payload)`, la creazione usa `create(payload)`.
- Gli enum e i payload devono essere verificati lungo l'intero percorso frontend → API → Zod → service → Prisma.

---

## ✅ Protocollo di Verifica Obbligatorio

Prima di considerare completato un task, eseguire sempre i seguenti comandi:

```bash
# 1. Compilazione TypeScript Backend
cd backend && npx tsc --noEmit

# 2. Suite completa Backend (richiede database e health check disponibili)
cd backend && npx jest --forceExit

# 3. Test unitari Backend
cd backend && npm run test:unit

# 4. Compilazione TypeScript Frontend
cd frontend && npx tsc --noEmit

# 5. Test unitari Frontend
cd frontend && npm run test:unit -- --runInBand

# 6. Controllo whitespace
git diff --check
```
