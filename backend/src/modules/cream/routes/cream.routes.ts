import { Express } from 'express';
import { container } from '../../../core/container';
import { CreamController } from '../controllers/CreamController';
import { adminOnly, authMiddleware } from '../../../core/middleware/auth.middleware';
import { requireFeature } from '../../../core/middleware/featureFlag.middleware';

export function registerCreamRoutes(app: Express): void {
  const controller = container.get(CreamController);

  app.get('/api/cream', authMiddleware, requireFeature('enableCream'), controller.getActive);
  app.get('/api/cream/active', authMiddleware, requireFeature('enableCream'), controller.getActive);
  app.post('/api/cream', authMiddleware, adminOnly, requireFeature('enableCream'), controller.create);
  app.get('/api/cream/summary', authMiddleware, requireFeature('enableCream'), controller.getSalesSummary);
  app.get('/api/cream/:id/sales', authMiddleware, requireFeature('enableCream'), controller.getSales);
  app.post('/api/cream/sales', authMiddleware, requireFeature('enableCream'), controller.createSale);
}