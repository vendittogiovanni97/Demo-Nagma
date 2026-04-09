import { Router } from 'express';
import { login, register, me } from '../controllers/auth.controller';
import { authMiddleware, adminOnly } from '../middlewares/auth.middleware';

const router = Router();

// Endpoint pubblico di login
router.post('/login', login);

// Endpoint di registrazione (protetto: solo admin autenticati)
router.post('/register', authMiddleware, adminOnly, register);

// Endpoint protetto per info profilo
router.get('/me', authMiddleware, me);

export default router;
