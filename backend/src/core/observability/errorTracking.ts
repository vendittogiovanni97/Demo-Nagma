/**
 * Error tracking (Sentry) — integrazione OPZIONALE e INERTE di default.
 *
 * - Si attiva SOLO se la variabile d'ambiente SENTRY_DSN è impostata.
 * - Il pacchetto @sentry/node NON è una dipendenza obbligatoria: viene caricato
 *   con require() dentro un try/catch, così se non è installato l'app continua
 *   a funzionare senza errori (utile in dev/CI). Per attivarlo in produzione:
 *       npm i @sentry/node
 *       export SENTRY_DSN="https://...@oXXXX.ingest.sentry.io/YYYY"
 *
 * Il caricamento via require (invece di import statico) è intenzionale: evita
 * che il typecheck/build fallisca quando il pacchetto non è ancora installato.
 */
import { logger } from '../shared/utils/logger';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sentry: any = null;

export function initErrorTracking(): void {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    logger.info('Error tracking disabilitato (SENTRY_DSN non impostata)');
    return;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    sentry = require('@sentry/node');
    sentry.init({
      dsn,
      environment: process.env.NODE_ENV ?? 'development',
      release: process.env.APP_VERSION,
      // Campiona il 10% delle transazioni per il tracing (regolabile).
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
    });
    logger.info('Error tracking (Sentry) inizializzato', {
      environment: process.env.NODE_ENV ?? 'development',
    });
  } catch {
    logger.warn(
      'SENTRY_DSN impostata ma pacchetto @sentry/node non installato. ' +
        'Esegui: npm i @sentry/node',
    );
    sentry = null;
  }
}

/**
 * Invia un'eccezione a Sentry se attivo; no-op altrimenti.
 * Non lancia mai: l'error tracking non deve mai rompere il flusso applicativo.
 */
export function captureException(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  if (!sentry) return;
  try {
    sentry.captureException(error, context ? { extra: context } : undefined);
  } catch {
    // Ignora: non far fallire la richiesta per un problema del reporter.
  }
}

export function isErrorTrackingEnabled(): boolean {
  return sentry !== null;
}
