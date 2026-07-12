import { Express } from 'express';
import { container } from '../../../core/container';
import { ConfigController } from '../controllers/config.controller';
import { authMiddleware, requireRoles } from '../../../core/middleware/auth.middleware';
import { requireFeature } from '../../../core/middleware/featureFlag.middleware';

export function registerConfigRoutes(app: Express): void {
  const controller = container.get(ConfigController);

  app.get('/api/config', authMiddleware, requireFeature('enableConfig'), controller.getConfig);
  app.post('/api/config', authMiddleware, requireRoles('SUPER_ADMIN'), requireFeature('enableConfig'), controller.updateConfig);
  app.get('/api/config/backup', authMiddleware, requireRoles('SUPER_ADMIN'), controller.downloadBackup);

  // ClientConfig endpoints
  app.get('/api/client-config', authMiddleware, requireFeature('enableConfig'), controller.getClientConfig);
  app.put('/api/client-config', authMiddleware, requireRoles('SUPER_ADMIN'), requireFeature('enableConfig'), controller.updateClientConfig);
}