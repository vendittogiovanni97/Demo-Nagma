import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller';

import { authMiddleware, requireRoles } from '../middlewares/auth.middleware';

const router = Router();
const controller = new TransactionController();

router.use(authMiddleware);

router.get('/summary', controller.getSummary);
router.get('/trends', controller.getTrends);
router.get('/performance', controller.getArtistPerformance);
router.get('/', controller.getAll);
router.post('/', requireRoles('ADMIN', 'USER'), controller.create);
router.delete('/:id', requireRoles('ADMIN', 'USER'), controller.delete);

export default router;
