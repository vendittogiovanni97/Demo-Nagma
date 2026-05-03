import { Router } from 'express';
import { container } from '../../../container';
import { authMiddleware, requireRoles } from '../../../middlewares/auth.middleware';
import { authRateLimiter } from '../../../middlewares/rateLimiter';

const router = Router();
const controller = container.bookingController;

router.use(authMiddleware);

router.get('/stats', controller.getStats);
router.get('/available-artists', controller.getAvailable);
router.post('/verify-password', authRateLimiter, controller.verifyPassword);
router.get('/history', controller.getAllHistory);
router.get('/', controller.getAll);
router.post('/', controller.create);
router.get('/:id/history', controller.getHistory);
router.put('/:id', controller.update);
router.delete('/:id', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.delete);
router.put('/:id/annul', controller.annul);

export default router;
