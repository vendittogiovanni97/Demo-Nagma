import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';

import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new BookingController();

router.use(authMiddleware);

router.get('/stats', controller.getStats);
router.get('/', controller.getAll);
router.post('/', controller.create);
router.get('/:id/history', controller.getHistory);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
