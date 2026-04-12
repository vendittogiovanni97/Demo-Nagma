import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, register, me } from '../controllers/auth.controller';
import { authMiddleware, adminOnly } from '../middlewares/auth.middleware';

const router = Router();

// Rate limit per il login: max 5 tentativi falliti ogni 15 minuti per IP.
// I tentativi riusciti non vengono conteggiati (skipSuccessfulRequests).
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Troppi tentativi di accesso. Riprova tra qualche minuto.',
    error: { code: 'RATE_LIMIT_EXCEEDED', statusCode: 429 },
  },
});

// Endpoint pubblico di login
router.post('/login', loginRateLimiter, login);

// Endpoint di registrazione (protetto: solo admin autenticati)
router.post('/register', authMiddleware, adminOnly, register);

// Endpoint protetto per info profilo
router.get('/me', authMiddleware, me);

export default router;
