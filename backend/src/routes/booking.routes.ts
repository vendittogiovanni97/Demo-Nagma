import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';

const router = Router();
const controller = new BookingController();

router.get('/stats', controller.getStats);
router.get('/', controller.getAll);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
