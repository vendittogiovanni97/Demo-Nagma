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

## Test e Verifica

```bash
# Verifica tipi TypeScript (Backend + Frontend)
npm run typecheck

# Backend unit test (16 suite, 134 test)
npm run test

# Backend security audit OWASP (21 test)
cd backend && npx jest test/security/ --forceExit

# Frontend E2E (10 test, richiede backend + frontend attivi)
cd frontend && npx playwright test --project=chromium

# Load test (richiede k6 installato + backend attivo)
k6 run backend/test/load/scenario.k6.js
```

