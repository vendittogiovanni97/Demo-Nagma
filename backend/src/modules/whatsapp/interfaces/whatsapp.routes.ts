import { Router } from 'express';
import { container } from '../../../container';
import { authMiddleware, requireRoles } from '../../../middlewares/auth.middleware';

const router = Router();
const controller = container.whatsappController;

router.use(authMiddleware);

router.get('/', controller.getAll);
router.get('/logs', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.getLogs);
router.post('/send', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.sendManual);
router.post('/:id/duplicate', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.duplicate);
router.post('/', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.create);
router.put('/:id', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.update);
router.delete('/:id', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.delete);

export default router;
