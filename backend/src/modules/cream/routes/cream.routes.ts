import { Express } from 'express';
import { container } from '../../../core/container';
import { CreamController } from '../controllers/CreamController';
import { adminOnly, authMiddleware } from '../../../core/middleware/auth.middleware';

export function registerCreamRoutes(app: Express): void {
  const controller = container.get(CreamController);

  app.get('/api/cream', authMiddleware, controller.getActive);
  app.get('/api/cream/active', authMiddleware, controller.getActive);
  app.post('/api/cream', authMiddleware, adminOnly, controller.create);
  app.get('/api/cream/summary', authMiddleware, controller.getSalesSummary);
  app.get('/api/cream/:id/sales', authMiddleware, controller.getSales);
  app.post('/api/cream/sales', authMiddleware, controller.createSale);
}
