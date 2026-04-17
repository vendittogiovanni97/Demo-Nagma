import { Router } from 'express';
import { SpesaLiberaController } from '../controllers/spesa-libera.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new SpesaLiberaController();

router.use(authMiddleware);

router.get('/', controller.getAll);
router.post('/', controller.create);
router.delete('/:id', controller.delete);

export default router;
