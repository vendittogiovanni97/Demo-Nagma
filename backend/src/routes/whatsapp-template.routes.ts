import { Router } from 'express';
import { WhatsAppTemplateController } from '../controllers/whatsapp-template.controller';
import { authMiddleware, requireRoles } from '../middlewares/auth.middleware';

const router = Router();
const controller = new WhatsAppTemplateController();

router.use(authMiddleware);

router.get('/', controller.getAll);
router.get('/logs', requireRoles('ADMIN', 'USER'), controller.getLogs);
router.post('/send', requireRoles('ADMIN', 'USER'), controller.sendManual);
router.post('/:id/duplicate', requireRoles('ADMIN', 'USER'), controller.duplicate);
router.post('/', requireRoles('ADMIN', 'USER'), controller.create);
router.put('/:id', requireRoles('ADMIN', 'USER'), controller.update);
router.delete('/:id', requireRoles('ADMIN', 'USER'), controller.delete);

export default router;
