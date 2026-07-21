import { Express, Router } from 'express';
import { container } from '../../../core/container';
import { MetricsController } from '../controllers/metrics.controller';
import { authMiddleware } from '../../../core/middleware/auth.middleware';

export function registerMetricsRoutes(app: Express): void {
  const controller = container.get(MetricsController);
  const router = Router();

  // Endpoint pubblico per invio Web Vitals dal browser client
  router.post('/vitals', controller.recordVitals);

  // Endpoints protetti per la dashboard Admin
  router.use(authMiddleware);
  router.get('/summary', controller.getSummary);
  router.delete('/reset', controller.resetMetrics);

  app.use('/api/metrics', router);
}
