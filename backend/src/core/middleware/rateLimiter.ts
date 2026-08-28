import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { config } from '../config/env';
import { logger } from '../shared/utils/logger';

// FIX B5: Helper to get client IP with IPv6 support
const getClientIP = (req: Request): string => {
  // Check X-Forwarded-For header (for proxies, Docker, etc.)
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  // Fallback to direct request IP
  return req.ip || req.socket.remoteAddress || 'unknown';
};

// FIX B5: Simple in-memory store (note: for production with multiple instances, use Redis)
const requestCounts = new Map<string, { count: number; resetAt: number }>();

const getOrCreateBucket = (key: string, windowMs: number) => {
  const now = Date.now();
  const bucket = requestCounts.get(key);

  if (bucket && bucket.resetAt > now) {
    return bucket;
  }

  const newBucket = { count: 0, resetAt: now + windowMs };
  requestCounts.set(key, newBucket);
  return newBucket;
};

// Login rate limiter - reads LOGIN_RATE_LIMIT_WINDOW_MINUTES and LOGIN_RATE_LIMIT_MAX_ATTEMPTS from environment
const loginWindowMs = config.loginRateLimitWindowMs;
const loginMaxAttempts = config.loginRateLimitMaxAttempts;
// SECURITY (Audit H3): limite per-IP anti email-rotation
const loginIpMaxAttempts = config.loginIpRateLimitMaxAttempts;

/**
 * SECURITY (Audit H3): rate limiter per-account (email).
 * Nessun bypass basato su email hardcoded: l'indirizzo dell'account admin
 * non deve essere enumerabile dal comportamento del rate limiter, e nessun
 * account deve essere brute-forzabile senza limiti.
 * I tentativi riusciti non consumano budget (skipSuccessfulRequests).
 */
export const loginRateLimiter = rateLimit({
  windowMs: loginWindowMs,
  limit: loginMaxAttempts,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req: Request) => {
    return `login:${req.body?.email || getClientIP(req)}`;
  },
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit exceeded for login (per-account)', {
      key: req.ip,
      userId: req.user?.id,
    });
    res.status(429).json({
      success: false,
      message: 'Troppi tentativi di accesso. Riprova tra qualche minuto.',
      error: { code: 'RATE_LIMIT_EXCEEDED', statusCode: 429 },
    });
  },
  message: {
    success: false,
    message: 'Troppi tentativi di accesso. Riprova tra qualche minuto.',
    error: { code: 'RATE_LIMIT_EXCEEDED', statusCode: 429 },
  },
});

/**
 * SECURITY (Audit H3): rate limiter per-IP sul login.
 * Mitiga l'email-rotation (brute-force distribuito su molti account dallo
 * stesso IP). Soglia più alta del limite per-account per non penalizzare
 * NAT/uffici condivisi. Configurabile via LOGIN_IP_RATE_LIMIT_MAX_ATTEMPTS.
 */
export const loginIpRateLimiter = rateLimit({
  windowMs: loginWindowMs,
  limit: loginIpMaxAttempts,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req: Request) => `login-ip:${getClientIP(req)}`,
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit exceeded for login (per-IP)', {
      key: req.ip,
      userId: req.user?.id,
    });
    res.status(429).json({
      success: false,
      message: 'Troppi tentativi di accesso da questa rete. Riprova tra qualche minuto.',
      error: { code: 'RATE_LIMIT_EXCEEDED', statusCode: 429 },
    });
  },
  message: {
    success: false,
    message: 'Troppi tentativi di accesso da questa rete. Riprova tra qualche minuto.',
    error: { code: 'RATE_LIMIT_EXCEEDED', statusCode: 429 },
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: (req: Request) => req.user?.role === 'SUPER_ADMIN',
  // FIX B5: Use user ID if authenticated, fallback to IP (with IPv6 support)
  keyGenerator: (req: Request) => {
    if (req.user?.id) return `auth:user:${req.user.id}`;
    return `auth:ip:${getClientIP(req)}`;
  },
  message: {
    success: false,
    message: 'Troppi tentativi. Riprova tra qualche minuto.',
    error: { code: 'RATE_LIMIT_EXCEEDED', statusCode: 429 },
  },
});

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  // FIX B5: Bypass rate limiting for SUPER_ADMIN users
  skip: (req: Request) => {
    return req.user?.role === 'SUPER_ADMIN';
  },
  // FIX B5: Use user ID if authenticated, fallback to IP (with IPv6 support)
  keyGenerator: (req: Request) => {
    if (req.user?.id) return `api:user:${req.user.id}`;
    return `api:ip:${getClientIP(req)}`;
  },
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit exceeded for API', {
      key: req.ip,
      userId: req.user?.id,
      userRole: req.user?.role,
    });
    res.status(429).json({
      success: false,
      message: 'Troppe richieste. Riprova tra qualche minuto.',
      error: { code: 'RATE_LIMIT_EXCEEDED', statusCode: 429 },
    });
  },
  message: {
    success: false,
    message: 'Troppe richieste. Riprova tra qualche minuto.',
    error: { code: 'RATE_LIMIT_EXCEEDED', statusCode: 429 },
  },
});

/*
 * FIX B5: Production Redis Store (commented out - uncomment when Redis is available)
 *
 * For multi-instance deployments, use Redis instead of in-memory store:
 * npm install rate-limit-redis redis
 *
 * import RedisStore from 'rate-limit-redis';
 * import { createClient } from 'redis';
 *
 * const redisClient = createClient({
 *   host: process.env.REDIS_HOST || 'localhost',
 *   port: parseInt(process.env.REDIS_PORT || '6379', 10),
 * });
 *
 * redisClient.on('error', (err) => logger.error('Redis client error', { error: err.message }));
 *
 * const store = new RedisStore({
 *   client: redisClient,
 *   prefix: 'rl:',
 * });
 *
 * Then replace windowMs with store:
 * export const apiRateLimiter = rateLimit({
 *   store,
 *   limit: 100,
 *   ...
 * });
 */
