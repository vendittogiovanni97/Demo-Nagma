import { Router } from 'express';
import { container } from '../../../container';
import { authMiddleware, requireRoles } from '../../../middlewares/auth.middleware';

const router = Router();
const controller = container.customerController;

router.use(authMiddleware);

router.get('/', requireRoles('USER', 'ADMIN', 'SUPER_ADMIN'), controller.getAll);
router.get('/:id', requireRoles('USER', 'ADMIN', 'SUPER_ADMIN'), controller.getById);
router.get('/:id/summary', requireRoles('USER', 'ADMIN', 'SUPER_ADMIN'), controller.getSummary);
router.post('/', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.create);
router.put('/:id', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.update);
router.delete('/:id', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.delete);

export default router;
