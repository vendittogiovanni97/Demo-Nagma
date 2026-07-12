import { Express, Router } from 'express';
import { container } from '../../../core/container';
import { AttachmentController } from '../controllers/attachment.controller';
import { authMiddleware } from '../../../core/middleware/auth.middleware';

export function registerAttachmentRoutes(app: Express): void {
  const controller = container.get(AttachmentController);
  const router = Router();

  router.use(authMiddleware);

  router.post('/upload', controller.upload);
  router.get('/:attachmentId/download', controller.download);
  router.get('/:attachmentId/preview', controller.getPreview);
  router.get('/booking/:bookingId', controller.getByBooking);
  router.delete('/:attachmentId', controller.delete);

  app.use('/api/attachments', router);
}
