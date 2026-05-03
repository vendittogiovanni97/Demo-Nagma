import { Router } from 'express';
import { container } from '../../../container';
import { authMiddleware, adminOnly } from '../../../middlewares/auth.middleware';

const router = Router();
const controller = container.formTemplateController;

router.use(authMiddleware);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', adminOnly, controller.create);
router.put('/:id', adminOnly, controller.update);
router.delete('/:id', adminOnly, controller.delete);

export default router;
