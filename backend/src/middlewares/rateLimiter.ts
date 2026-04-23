import rateLimit from 'express-rate-limit';
import { config } from '../config/env';

export const loginRateLimiter = rateLimit({
  windowMs: config.loginRateLimitWindowMs,
  limit: config.loginRateLimitMaxAttempts,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
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
  message: {
    success: false,
    message: 'Troppe richieste. Riprova tra qualche minuto.',
    error: { code: 'RATE_LIMIT_EXCEEDED', statusCode: 429 },
  },
});