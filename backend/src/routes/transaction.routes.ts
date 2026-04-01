import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller';

import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new TransactionController();

router.use(authMiddleware);

router.get('/summary', controller.getSummary);
router.get('/trends', controller.getTrends);
router.get('/performance', controller.getArtistPerformance);
router.get('/', controller.getAll);
router.post('/', controller.create);
router.delete('/:id', controller.delete);

export default router;
