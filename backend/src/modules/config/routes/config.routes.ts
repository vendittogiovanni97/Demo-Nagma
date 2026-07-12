import { Express } from 'express';
import { container } from '../../../core/container';
import { ConfigController } from '../controllers/config.controller';
import { authMiddleware, requireRoles } from '../../../core/middleware/auth.middleware';

export function registerConfigRoutes(app: Express): void {
  const controller = container.get(ConfigController);

  app.get('/api/config', authMiddleware, controller.getConfig);
  app.post('/api/config', authMiddleware, requireRoles('SUPER_ADMIN'), controller.updateConfig);
  app.get('/api/config/backup', authMiddleware, requireRoles('SUPER_ADMIN'), controller.downloadBackup);
}
