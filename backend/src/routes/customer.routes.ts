import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';

import { authMiddleware, requireRoles } from '../middlewares/auth.middleware';

const router = Router();
const controller = new CustomerController();

router.use(authMiddleware);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', requireRoles('ADMIN', 'USER'), controller.create);
router.put('/:id', requireRoles('ADMIN', 'USER'), controller.update);
router.delete('/:id', requireRoles('ADMIN', 'USER'), controller.delete);

export default router;
