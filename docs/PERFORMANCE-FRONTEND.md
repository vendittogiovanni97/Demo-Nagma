# Performance frontend — bundle & code-splitting

> Aggiornato: 2026-08-05.

## Cosa è stato fatto

- **`optimizePackageImports`** esteso in `next.config.ts` con `recharts`,
  `ag-grid-react`, `ag-grid-community` (oltre a MUI/date-fns/lucide/FullCalendar
  già presenti): migliora il tree-shaking dei barrel import.
- **Bundle analyzer** integrato (attivo solo con `ANALYZE=true`, nessun impatto
  sulla build normale).

### Come analizzare il bundle

```bash
cd frontend
npm i -D @next/bundle-analyzer      # una tantum
ANALYZE=true npm run build          # apre i report dei chunk
```

(È utile aggiungere in `frontend/package.json` lo script:
`"analyze": "ANALYZE=true next build"`.)

## Split a livello di rotta consigliati (da applicare con test manuale)

I tre pesi maggiori sono **AG Grid**, **FullCalendar**, **Recharts**. Non li ho
convertiti automaticamente perché AG Grid e FullCalendar usano `ref` per le API
imperative e le regole SSR di App Router richiedono che il componente padre sia
`"use client"`: modifiche da validare eseguendo l'app. Snippet pronti:

**Recharts** (widget dashboard). Estrarre il grafico in un componente client e:
```tsx
import dynamic from 'next/dynamic';
const FinancePieChart = dynamic(() => import('./FinancePieChart'), {
  ssr: false,
  loading: () => <Skeleton variant="circular" width={160} height={160} />,
});
```

**FullCalendar** (pagina Agenda). Poiché usa un `ref` per l'API, mantenere
`FullCalendar` come import diretto ma caricare l'intera `AgendaCalendar` via
`dynamic` dal genitore `"use client"`:
```tsx
const AgendaCalendar = dynamic(() => import('../components/AgendaCalendar'), {
  ssr: false,
  loading: () => <CalendarSkeleton />,
});
```

**AG Grid** (DataTable, componente centrale): valutare `dynamic(..., { ssr:false })`
sul solo `DataTableGrid`, verificando che il forwarding del `ref` alla grid
resti funzionante. Data la centralità, testare a fondo prima del merge.

## Verifica

Dopo ogni split: `npm run build` e confronto della dimensione dei chunk con
`ANALYZE=true`, più smoke test manuale della rotta interessata.
