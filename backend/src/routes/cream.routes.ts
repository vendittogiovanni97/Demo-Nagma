import { Router } from 'express';
import { CreamController } from '../controllers/cream.controller';

import { authMiddleware, requireRoles } from '../middlewares/auth.middleware';

const router = Router();
const controller = new CreamController();

router.use(authMiddleware);

router.get('/', controller.getAll);
router.post('/', requireRoles('ADMIN', 'USER'), controller.create);
router.put('/:id', requireRoles('ADMIN', 'USER'), controller.update);
router.delete('/:id', requireRoles('ADMIN', 'USER'), controller.delete);

router.get('/sales', controller.getSales);
router.post('/sales', requireRoles('ADMIN', 'USER'), controller.registerSale);

export default router;
