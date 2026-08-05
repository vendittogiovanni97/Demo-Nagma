# Osservabilità

> Come è strumentato il backend e come attivare error tracking e dashboard.
> Aggiornato: 2026-08-05.

## Cosa c'è già

- **Logger strutturato** (`core/shared/utils/logger.ts`): livelli DEBUG/INFO/WARN/ERROR, `requestId` per ogni richiesta, `errorWithStack`.
- **Request tracing**: ogni richiesta ha un `x-request-id` (header di risposta) propagato nei log.
- **Metriche**: `MetricsService` registra metodo, path, status, durata e userId di ogni richiesta; esposte su `GET /api/metrics`.
- **Alert performance**: le richieste >1s loggano WARN, quelle >5s loggano ERROR (`app.ts`).

## Error tracking (Sentry) — opzionale

Integrazione pronta in `core/observability/errorTracking.ts`, **inerte finché non configurata**:

1. Installa il pacchetto:
   ```bash
   cd backend && npm i @sentry/node
   ```
2. Imposta le variabili (vedi `.env.example`):
   ```
   SENTRY_DSN=https://...@oXXXX.ingest.sentry.io/YYYY
   SENTRY_TRACES_SAMPLE_RATE=0.1
   ```
3. Fatto. Al boot `initErrorTracking()` inizializza Sentry; il `globalErrorHandler`
   invia automaticamente a Sentry ogni errore 500 con `requestId`, metodo, path e userId.

Senza `SENTRY_DSN` l'app funziona identica (nessun invio, nessun errore). Se il DSN
è impostato ma il pacchetto non è installato, viene loggato un warning e si prosegue.

## Dashboard metriche & alerting — come completarla

`GET /api/metrics` è la sorgente dati. Opzioni, dalla più rapida alla più completa:

- **Rapida**: una pagina HTML che fa polling di `/api/metrics` (con Bearer token
  admin) e mostra p95/p99, tasso errori e top endpoint lenti. Adatta come artifact
  interno.
- **Prod-grade**: esporre le metriche in formato Prometheus e collegare
  Grafana; configurare alert (es. p95 > 1s per 5 min, error rate > 2%) verso
  Slack/email. Gli alert su richieste lente hanno già la soglia lato log (>1s/>5s)
  da promuovere ad alert reali.

> Suggerimento: riusare le stesse soglie del load test k6
> (`backend/test/load/scenario.k6.js`) come SLO condivisi tra performance test e
> alerting di produzione, così i due parlano la stessa lingua.
