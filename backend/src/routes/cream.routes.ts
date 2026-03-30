import { Router } from 'express';
import { CreamController } from '../controllers/cream.controller';

const router = Router();
const controller = new CreamController();

router.get('/', controller.getAll);
router.post('/', controller.create);
router.put('/:id', controller.update);

router.get('/sales', controller.getSales);
router.post('/sales', controller.registerSale);

export default router;
