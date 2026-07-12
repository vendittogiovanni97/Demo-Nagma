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

## Test
```bash
cd backend && npx jest --forceExit   # unit test
cd frontend && npx playwright test    # E2E
cd backend && k6 run test/load/scenario.k6.js  # load test
```
