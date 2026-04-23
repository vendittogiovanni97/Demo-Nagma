import { Router } from 'express';
import { CreamController } from '../controllers/cream.controller';
import { authMiddleware, requireRoles } from '../middlewares/auth.middleware';

const controller = new CreamController();
const router = Router();

router.use(authMiddleware);

router.get('/', requireRoles('ADMIN', 'USER', 'SUPER_ADMIN'), controller.getActive);
router.post('/', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.create);
router.get('/:id/sales', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.getSales);
router.post('/sales', requireRoles('ADMIN', 'USER', 'SUPER_ADMIN'), controller.createSale);
router.get('/summary', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.getSalesSummary);

export default router;