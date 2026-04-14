import { Router } from 'express';
import { StaffController } from '../controllers/staff.controller';
import { authMiddleware, requireRoles } from '../middlewares/auth.middleware';

const router = Router();
const controller = new StaffController();

router.use(authMiddleware);

router.get('/', controller.getAll);
router.post('/', requireRoles('ADMIN'), controller.create);
router.delete('/:id', requireRoles('ADMIN'), controller.delete);

export default router;
