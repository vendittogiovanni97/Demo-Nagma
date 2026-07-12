import { Express, Router } from 'express';
import { container } from '../../../core/container';
import { BookingController } from '../controllers/booking.controller';
import { authMiddleware, requireRoles } from '../../../core/middleware/auth.middleware';
import { authRateLimiter } from '../../../core/middleware/rateLimiter';

export function registerBookingRoutes(app: Express): void {
  const controller = container.get(BookingController);
  const router = Router();

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

  app.use('/api/bookings', router);
}
