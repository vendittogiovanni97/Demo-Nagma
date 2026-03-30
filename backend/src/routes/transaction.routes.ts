import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller';

const router = Router();
const controller = new TransactionController();

router.get('/summary', controller.getSummary); // Deve essere prima di /:id se ci fosse un /:id
router.get('/', controller.getAll);
router.post('/', controller.create);
router.delete('/:id', controller.delete);

export default router;
