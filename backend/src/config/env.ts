/**
 * Configurazione centralizzata — tutti i valori leggono da .env con fallback sensati.
 * Modifica il .env per cambiare comportamento senza toccare codice.
 */

import type { StringValue } from 'ms';

function envInt(key: string, fallback: number): number {
  const val = process.env[key];
  return val ? parseInt(val, 10) : fallback;
}

function envStr(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const config = {
  // JWT
  jwtExpiry: envStr('JWT_EXPIRY', '8h') as StringValue,

  // Sicurezza
  bcryptSaltRounds: envInt('BCRYPT_SALT_ROUNDS', 10),
  loginRateLimitWindowMs: envInt('LOGIN_RATE_LIMIT_WINDOW_MINUTES', 15) * 60 * 1000,
  loginRateLimitMaxAttempts: envInt('LOGIN_RATE_LIMIT_MAX_ATTEMPTS', 5),
  jsonPayloadLimit: envStr('JSON_PAYLOAD_LIMIT', '1mb'),

  // Paginazione
  defaultPageLimit: envInt('DEFAULT_PAGE_LIMIT', 20),
  // Business
  defaultBookingDurationMinutes: envInt('DEFAULT_BOOKING_DURATION_MINUTES', 60),
  defaultBookingType: envStr('DEFAULT_BOOKING_TYPE', 'Tattoo'),
  defaultTrendsMonths: envInt('DEFAULT_TRENDS_MONTHS', 6),
  whatsappLogsRetentionDays: envInt('WHATSAPP_LOGS_RETENTION_DAYS', 30),
  whatsappLogsFetchLimit: envInt('WHATSAPP_LOGS_FETCH_LIMIT', 10),

  // Resilienza
  restartDelayMs: envInt('RESTART_DELAY_MS', 10_000),
} as const;
