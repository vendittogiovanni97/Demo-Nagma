import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { configService } from '../services/config.service';
import { logger } from '../utils/logger';

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

// Login rate limiter - reads LOGIN_RATE_LIMIT_WINDOW_MINUTES and LOGIN_RATE_LIMIT_MAX_ATTEMPTS
// from configService (set in DB or fallback to defaults)
const loginWindowMinutes = configService.getLoginRateLimitWindowMinutesSync();
const loginMaxAttempts = configService.getLoginRateLimitMaxAttemptsSync();
const loginWindowMs = loginWindowMinutes * 60 * 1000;

export const loginRateLimiter = rateLimit({
  windowMs: loginWindowMs,
  limit: loginMaxAttempts,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  // FIX B5: Use user ID if authenticated, fallback to IP (with IPv6 support)
  keyGenerator: (req: Request) => {
    if (req.user?.id) return `login:user:${req.user.id}`;
    return `login:ip:${getClientIP(req)}`;
  },
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit exceeded for login', {
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

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
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