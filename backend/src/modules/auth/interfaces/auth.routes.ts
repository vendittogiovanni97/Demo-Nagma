import { Router } from 'express';
import { container } from '../../../container';
import { adminOnly, authMiddleware } from '../../../middlewares/auth.middleware';
import { authRateLimiter, loginRateLimiter } from '../../../middlewares/rateLimiter';

const router = Router();
const controller = container.authController;

router.post('/login', loginRateLimiter, controller.login);
router.post('/register', authRateLimiter, authMiddleware, adminOnly, controller.register);
router.get('/me', authMiddleware, controller.me);
router.put('/me', authMiddleware, controller.updateMe);
router.put('/me/password', authRateLimiter, authMiddleware, controller.changePassword);
router.post('/refresh', authMiddleware, controller.refresh);

export default router;
