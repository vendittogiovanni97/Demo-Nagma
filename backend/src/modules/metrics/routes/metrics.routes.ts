import { Express, Router } from 'express';
import { container } from '../../../core/container';
import { MetricsController } from '../controllers/metrics.controller';
import { authMiddleware, requireRoles } from '../../../core/middleware/auth.middleware';
import { authRateLimiter } from '../../../core/middleware/rateLimiter';

export function registerMetricsRoutes(app: Express): void {
  const controller = container.get(MetricsController);
  const router = Router();

  // Endpoint pubblico per invio Web Vitals dal browser client — rate-limited per prevenire flooding
  router.post('/vitals', authRateLimiter, controller.recordVitals);

  // Endpoints protetti per la dashboard Admin
  router.use(authMiddleware);
  router.get('/summary', controller.getSummary);
  router.delete('/reset', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.resetMetrics);

  app.use('/api/metrics', router);
}
