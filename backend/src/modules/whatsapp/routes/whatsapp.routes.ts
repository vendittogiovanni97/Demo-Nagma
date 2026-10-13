import { Express, Router } from 'express';
import { container } from '../../../core/container';
import { WhatsAppController } from '../controllers/whatsapp.controller';
import { authMiddleware, requireRoles } from '../../../core/middleware/auth.middleware';
import { requireFeature } from '../../../core/middleware/featureFlag.middleware';

export function registerWhatsAppRoutes(app: Express): void {
  const controller = container.get(WhatsAppController);
  const router = Router();

  router.use(authMiddleware);
  router.use(requireFeature('enableWhatsApp'));

  router.get('/', controller.getAll);
  router.get('/connection-status', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.getConnectionStatus);
  router.post('/connect', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.connectWhatsApp);
  router.post('/disconnect', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.disconnectWhatsApp);
  router.get('/birthdays/today', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.getTodayBirthdays);
  router.post('/birthdays/send-today', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.sendTodayBirthdays);
  router.get('/logs', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.getLogs);
  router.post('/send', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.sendManual);
  router.post('/:id/duplicate', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.duplicate);
  router.post('/', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.create);
  router.put('/:id', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.update);
  router.delete('/:id', requireRoles('ADMIN', 'SUPER_ADMIN'), controller.delete);

  app.use('/api/whatsapp-templates', router);
}