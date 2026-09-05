import type { Request } from 'express';

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

type LogMeta = Record<string, unknown>;

const ANSI = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  gray: '\x1b[90m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  magenta: '\x1b[35m',
} as const;

// Log level hierarchy: DEBUG < INFO < WARN < ERROR
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
} as const;

const LEVEL_COLOR: Record<LogLevel, string> = {
  DEBUG: ANSI.gray,
  INFO: ANSI.blue,
  WARN: ANSI.yellow,
  ERROR: ANSI.red,
};

const LEVEL_LABEL: Record<LogLevel, string> = {
  DEBUG: 'DBG',
  INFO: 'INF',
  WARN: 'WRN',
  ERROR: 'ERR',
};

function timestamp() {
  return new Date().toISOString();
}

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return error;
}

function formatMeta(meta?: LogMeta): string {
  if (!meta || Object.keys(meta).length === 0) return '';

  if (!isDevelopmentEnv()) {
    // In produzione: JSON compatto su unica riga
    try {
      return ` ${JSON.stringify(meta)}`;
    } catch {
      return ' {"meta":"unserializable"}';
    }
  }

  // In sviluppo: formato human-readable senza chiavi ridondanti
  const SKIP_KEYS = new Set(['requestId', 'method', 'path', 'statusCode', 'durationMs']);
  const entries = Object.entries(meta).filter(([k]) => !SKIP_KEYS.has(k));

  if (entries.length === 0) return '';

  const parts = entries.map(([k, v]) => {
    if (v === undefined || v === null) return null;
    const val = typeof v === 'object' ? JSON.stringify(v) : String(v);
    return `${ANSI.dim}${k}${ANSI.reset}=${ANSI.cyan}${val}${ANSI.reset}`;
  }).filter(Boolean);

  return parts.length > 0 ? `  ${parts.join('  ')}` : '';
}

/**
 * Ottieni il livello di log configurato (reads from configService post-init)
 * Fallback a .env se config non ancora inizializzato
 */
function getLogLevelSync(): LogLevel {
  const envLevel = process.env.LOG_LEVEL as string | undefined;
  if (envLevel && envLevel in LOG_LEVEL_PRIORITY) {
    return envLevel as LogLevel;
  }
  return 'INFO';
}

/**
 * Controlla se il log dovrebbe essere scritto in base al livello configurato
 */
function shouldLog(level: LogLevel): boolean {
  const configuredLevel = getLogLevelSync();
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[configuredLevel];
}

function buildLine(level: LogLevel, message: string, meta?: LogMeta): string {
  if (!isDevelopmentEnv()) {
    // Produzione: JSON strutturato machine-readable
    const payload = { ts: timestamp(), level, msg: message, ...meta };
    try {
      return JSON.stringify(payload);
    } catch {
      return JSON.stringify({ ts: timestamp(), level, msg: message });
    }
  }

  // Sviluppo: formato leggibile
  const color = LEVEL_COLOR[level];
  const label = LEVEL_LABEL[level];
  const ts = `${ANSI.dim}${timestamp().slice(11, 23)}${ANSI.reset}`; // solo HH:MM:SS.mmm
  const lvl = `${color}${ANSI.bold}${label}${ANSI.reset}`;
  const msg = `${color}${message}${ANSI.reset}`;

  return `${ts} ${lvl} ${msg}${formatMeta(meta)}`;
}

function writeLog(level: LogLevel, message: string, meta?: LogMeta) {
  if (!shouldLog(level)) return;

  const line = buildLine(level, message, meta);

  if (level === 'ERROR') {
    // eslint-disable-next-line no-console
    console.error(line);
    return;
  }

  if (level === 'WARN') {
    // eslint-disable-next-line no-console
    console.warn(line);
    return;
  }

  // eslint-disable-next-line no-console
  console.log(line);
}

export const logger = {
  debug(message: string, meta?: LogMeta) {
    writeLog('DEBUG', message, meta);
  },
  info(message: string, meta?: LogMeta) {
    writeLog('INFO', message, meta);
  },
  warn(message: string, meta?: LogMeta) {
    writeLog('WARN', message, meta);
  },
  error(message: string, meta?: LogMeta) {
    writeLog('ERROR', message, meta);
  },
  errorWithStack(message: string, error: unknown, meta?: LogMeta) {
    writeLog('ERROR', message, {
      ...meta,
      error: serializeError(error),
    });
  },
};

/**
 * Leggi DEBUG_HTTP dalla config (post-init)
 * Fallback a .env se config non ancora inizializzato
 */
export function isDebugHttpEnabled(): boolean {
  return process.env.DEBUG_HTTP === 'true';
}

export function isDevelopmentEnv() {
  return process.env.NODE_ENV !== 'production';
}

export function getRequestContext(req: Request) {
  return {
    requestId: req.headers['x-request-id'] || req.requestId,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    userId: req.user?.id,
    role: req.user?.role,
  };
}

const SENSITIVE_KEYS = [
  'password',
  'token',
  'authorization',
  'accessToken',
  'refreshToken',
  'jwt',
  'secret',
] as const;

export function sanitizeForLog(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeForLog(entry));
  }

  if (value && typeof value === 'object') {
    const output: Record<string, unknown> = {};

    Object.entries(value).forEach(([key, entryValue]) => {
      const isSensitive = SENSITIVE_KEYS.some((sensitiveKey) =>
        key.toLowerCase().includes(sensitiveKey.toLowerCase())
      );

      output[key] = isSensitive ? '[REDACTED]' : sanitizeForLog(entryValue);
    });

    return output;
  }

  return value;
}
