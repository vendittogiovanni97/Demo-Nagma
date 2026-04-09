import { Router } from 'express';
import { CreamController } from '../controllers/cream.controller';

import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new CreamController();

router.use(authMiddleware);

router.get('/', controller.getAll);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

router.get('/sales', controller.getSales);
router.post('/sales', controller.registerSale);

export default router;
