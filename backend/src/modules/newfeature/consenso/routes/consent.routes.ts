import { Express } from 'express';
import { container } from '../../../../core/container';
import { ConsentController } from '../controllers/consent.controller';
import { authMiddleware } from '../../../../core/middleware/auth.middleware';

export function registerConsentRoutes(app: Express): void {
  const controller = container.get(ConsentController);

  app.get('/api/newfeature/booking/:id', controller.getBookingPublic);
  app.post('/api/newfeature/booking/:id/consent', controller.submitConsent);
  app.get('/api/newfeature/consents', authMiddleware, controller.listConsents);
}
