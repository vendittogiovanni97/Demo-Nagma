import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { config } from '../config/env';
import { login, me, register } from '../controllers/auth.controller';
import { adminOnly, authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

const loginRateLimiter = rateLimit({
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

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Effettua login
 *     description: Autentica un utente e restituisce un token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@nagma.it
 *               password:
 *                 type: string
 *                 format: password
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login effettuato con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Credenziali non valide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', loginRateLimiter, login);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registra un nuovo utente
 *     description: Crea un nuovo utente (solo admin)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Mario Rossi
 *               email:
 *                 type: string
 *                 format: email
 *                 example: mario@nagma.it
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *               role:
 *                 type: string
 *                 enum: [ADMIN, USER, ARTIST]
 *                 example: ARTIST
 *               phone:
 *                 type: string
 *                 example: +39 333 123456
 *               color:
 *                 type: string
 *                 example: "#3b82f6"
 *     responses:
 *       201:
 *         description: Utente creato con successo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       403:
 *         description: Non autorizzato
 *       409:
 *         description: Email già in uso
 */
router.post('/register', authMiddleware, adminOnly, register);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Ottieni il profilo corrente
 *     description: Restituisce le informazioni dell'utente autenticato
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profilo utente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Non autenticato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/me', authMiddleware, me);

export default router;
