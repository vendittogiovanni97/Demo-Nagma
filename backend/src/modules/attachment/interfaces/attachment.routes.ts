import { Router } from 'express';
import { container } from '../../../container';
import { authMiddleware } from '../../../middlewares/auth.middleware';

const router = Router();
const controller = container.attachmentController;

router.use(authMiddleware);

router.post('/upload', controller.upload);
router.get('/:attachmentId/download', controller.download);
router.get('/:attachmentId/preview', controller.getPreview);
router.get('/booking/:bookingId', controller.getByBooking);
router.delete('/:attachmentId', controller.delete);

export default router;
