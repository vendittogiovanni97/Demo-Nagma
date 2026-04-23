import { Router } from 'express';
import { BookingHistoryController } from '../controllers/booking-history.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new BookingHistoryController();

router.get('/', authMiddleware, controller.getAll);

export default router;