import { Express, Router } from 'express';
import { container } from '../../../core/container';
import { ExportController } from '../controllers/export.controller';
import { authMiddleware } from '../../../core/middleware/auth.middleware';

export function registerExportRoutes(app: Express): void {
  const exportController = container.get(ExportController);
  const router = Router();

  router.use(authMiddleware);
  router.post('/', exportController.exportData);

  app.use('/api/export', router);
}
