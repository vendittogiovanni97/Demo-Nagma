import { Express, Router } from 'express';
import { container } from '../../../core/container';
import { WhatsAppController } from '../controllers/whatsapp.controller';
import { authMiddleware, requireRoles } from '../../../core/middleware/auth.middleware';

export function registerWhatsAppRoutes(app: Express): void {
  const controller = container.get(WhatsAppController);
  const router = Router();

  router.use(authMiddleware);

  router.get('/', controller.getAll);
  router.get('/logs', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.getLogs);
  router.post('/send', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.sendManual);
  router.post('/:id/duplicate', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.duplicate);
  router.post('/', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.create);
  router.put('/:id', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.update);
  router.delete('/:id', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.delete);

  app.use('/api/whatsapp-templates', router);
}
