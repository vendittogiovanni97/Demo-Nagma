import { Router } from 'express';
import { container } from '../../../container';
import { adminOnly, authMiddleware } from '../../../middlewares/auth.middleware';

const router = Router();
const controller = container.creamController;

router.use(authMiddleware);

router.get('/active', controller.getActive);
router.post('/', adminOnly, controller.create);
router.get('/:id/sales', controller.getSales);
router.post('/sales', controller.createSale);
router.get('/summary', controller.getSalesSummary);

export default router;
