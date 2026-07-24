# Contributing

## Branch naming
- `feature/descrizione` — nuove feature
- `bugfix/descrizione` — bug fix
- `hotfix/descrizione` — fix urgente in produzione

## Commit
Formato libero, chiaro e in italiano.

## PR
- Descrivere cosa fa e perché
- Test inclusi? (sempre sì)
- Screenshot per modifiche UI
- Assegnare reviewer dal team

## Codice
- `CLAUDE.md` e `.claude/rules/` contengono tutte le regole
- Handler factory obbligatoria (no try/catch nei controller)
- Dati seed solo in JSON, mai in .env
- Colori solo dal tema MUI, mai hardcoded
- Pulsanti semantici: `SaveButton`, `CancelButton`, `DeleteButton`, `OkButton`, `CloseButton` — mai `<Button>` generico per azioni standard
- Tabelle: usare `DataTable`; le azioni si dichiarano con `rowActions` e `TableAction[]`, senza JSX duplicato nelle pagine
- AG Grid: usare la prop `loading`, senza gestione imperativa degli overlay
- Form: usare `FormInput`, `FormSelect`, `TextareaInput` e `CheckboxInput`
- Export: usare `ExportModal` e `/api/export`; non introdurre flussi paralleli
- Ogni bug funzionale corretto deve avere un test di regressione mirato

## Test e Verifica

```bash
# Verifica tipi TypeScript (Backend + Frontend)
npm run typecheck

# Backend: suite unit, integration e security
npm run test

# Backend: soli test unitari (non richiedono server integration)
npm run test:unit

# Frontend: test unitari Jest
npm run test:unit --prefix frontend -- --runInBand

# Backend security audit OWASP (21 test)
cd backend && npx jest test/security/ --forceExit

# Frontend E2E (10 test, richiede backend + frontend attivi)
cd frontend && npx playwright test --project=chromium

# Load test (richiede k6 installato + backend attivo)
k6 run backend/test/load/scenario.k6.js

# Controllo whitespace
git diff --check
```

La suite backend completa avvia un server di test e richiede PostgreSQL e `/health` raggiungibili. Un timeout del global setup va classificato come problema di ambiente o avvio prima di attribuirlo ai test unitari.
