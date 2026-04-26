import rateLimit from 'express-rate-limit';
import { configService } from '../services/config.service';

// Login rate limiter - legge LOGIN_RATE_LIMIT_WINDOW_MINUTES e LOGIN_RATE_LIMIT_MAX_ATTEMPTS
// da configService (valorizzati in DB o fallback a defaults)
const loginWindowMinutes = configService.getLoginRateLimitWindowMinutesSync();
const loginMaxAttempts = configService.getLoginRateLimitMaxAttemptsSync();

export const loginRateLimiter = rateLimit({
  windowMs: loginWindowMinutes * 60 * 1000,
  limit: loginMaxAttempts,
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