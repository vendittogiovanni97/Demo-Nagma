import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { adminOnly, authMiddleware } from '../middlewares/auth.middleware';
import { authRateLimiter, loginRateLimiter } from '../middlewares/rateLimiter';

const controller = new AuthController();
const router = Router();

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
router.post('/login', loginRateLimiter, controller.login);

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
router.post('/register', authRateLimiter, authMiddleware, adminOnly, controller.register);

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
router.get('/me', authMiddleware, controller.me);

/**
 * @swagger
 * /api/auth/me:
 *   put:
 *     summary: Aggiorna il profilo corrente
 *     description: Consente all'utente di aggiornare il proprio profilo (solo name e phone)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Marco Rossi
 *               phone:
 *                 type: string
 *                 example: +39 333 987654
 *     responses:
 *       200:
 *         description: Profilo aggiornato con successo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Non autenticato
 */
router.put('/me', authMiddleware, controller.updateMe);

/**
 * @swagger
 * /api/auth/me/password:
 *   put:
 *     summary: Cambia la password dell'utente corrente
 *     description: Consente all'utente di cambiare la propria password fornendo quella attuale
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: password_attuale
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: nuova_password_123
 *     responses:
 *       200:
 *         description: Password aggiornata con successo
 *       401:
 *         description: Password attuale non corretta o non autenticato
 */
router.put('/me/password', authRateLimiter, authMiddleware, controller.changePassword);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Rinnova il token JWT
 *     description: Emette un nuovo token JWT se quello corrente è ancora valido
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nuovo token emesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Token non valido o scaduto
 */
router.post('/refresh', authMiddleware, controller.refresh);

export default router;
