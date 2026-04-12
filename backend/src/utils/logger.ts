import type { Request } from 'express';

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

type LogMeta = Record<string, unknown>;

const ANSI = {
  reset: '\x1b[0m',
  gray: '\x1b[90m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
} as const;

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

function formatMeta(meta?: LogMeta) {
  if (!meta || Object.keys(meta).length === 0) return '';

  try {
    return ` ${JSON.stringify(meta)}`;
  } catch {
    return ' {"meta":"unserializable"}';
  }
}

function colorize(level: LogLevel, value: string) {
  if (!isDevelopmentEnv()) return value;

  if (level === 'INFO') return `${ANSI.blue}${value}${ANSI.reset}`;
  if (level === 'WARN') return `${ANSI.yellow}${value}${ANSI.reset}`;
  if (level === 'ERROR') return `${ANSI.red}${value}${ANSI.reset}`;
  return `${ANSI.gray}${value}${ANSI.reset}`;
}

function writeLog(level: LogLevel, message: string, meta?: LogMeta) {
  const line = `${colorize(level, timestamp())} ${colorize(level, `[${level}]`)} ${message}${formatMeta(meta)}`;

  if (level === 'ERROR') {
    console.error(line);
    return;
  }

  if (level === 'WARN') {
    console.warn(line);
    return;
  }

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

export function isDebugHttpEnabled() {
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
