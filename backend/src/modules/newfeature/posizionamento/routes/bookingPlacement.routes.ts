import { Express } from 'express';
import { container } from '../../../../core/container';
import { BookingPlacementController } from '../controllers/bookingPlacement.controller';
import { authMiddleware } from '../../../../core/middleware/auth.middleware';

export function registerBookingPlacementRoutes(app: Express): void {
  const controller = container.get(BookingPlacementController);

  app.get('/api/newfeature/booking/:id/placement', authMiddleware, controller.getPlacement);
  app.post('/api/newfeature/booking/:id/placement', authMiddleware, controller.upsertPlacement);
}
