import { Express, Router } from 'express';
import { container } from '../../../core/container';
import { ReportsController } from '../controllers/reports.controller';
import { authMiddleware } from '../../../core/middleware/auth.middleware';

export function registerReportRoutes(app: Express): void {
  const reportsController = container.get(ReportsController);
  const router = Router();

  router.use(authMiddleware);

  router.get('/summary', reportsController.getSummary);
  router.get('/details', reportsController.getDetails);
  router.get('/export', reportsController.exportReport);

  app.use('/api/reports', router);
}
