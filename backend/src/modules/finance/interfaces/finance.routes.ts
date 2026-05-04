import { Router } from 'express';
import { container } from '../../../container';
import { authMiddleware, requireRoles, adminOnly } from '../../../middlewares/auth.middleware';

const router = Router();
const transactionController = container.transactionController;
const spesaLiberaController = container.spesaLiberaController;

router.use(authMiddleware);

// Transactions
router.get('/transactions', transactionController.getAll);
router.get('/transactions/history', adminOnly, transactionController.getHistory);
router.get('/transactions/summary', transactionController.getSummary);
router.get('/transactions/trends', transactionController.getTrends);
router.get('/transactions/artist-performance', transactionController.getArtistPerformance);
router.post('/transactions', adminOnly, transactionController.create);
router.patch('/transactions/:id', adminOnly, transactionController.update);
router.delete('/transactions/:id', adminOnly, transactionController.delete);


// Spese Libere
router.get('/spese-libere', spesaLiberaController.getAll);
router.post('/spese-libere', adminOnly, spesaLiberaController.create);
router.delete('/spese-libere/:id', adminOnly, spesaLiberaController.delete);

export default router;
