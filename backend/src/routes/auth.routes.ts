import { Router } from 'express';
import { login, register, me } from '../controllers/auth.controller';
import { authMiddleware, adminOnly } from '../middlewares/auth.middleware';

const router = Router();

// Endpoint pubblico di login
router.post('/login', login);

// Endpoint di registrazione (protetto per admin in produzione, aperto per test iniziale)
router.post('/register', register); 

// Endpoint protetto per info profilo
router.get('/me', authMiddleware, me);

export default router;
