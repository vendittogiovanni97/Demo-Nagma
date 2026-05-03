import { Router } from 'express';
import { container } from '../../../container';
import { authMiddleware, requireRoles, adminOnly } from '../../../middlewares/auth.middleware';

const router = Router();
const transactionController = container.transactionController;
const spesaLiberaController = container.spesaLiberaController;

router.use(authMiddleware);

// Transactions
router.get('/transactions', transactionController.getAll);
router.get('/transactions/summary', transactionController.getSummary);
router.get('/transactions/trends', transactionController.getTrends);
router.get('/transactions/artist-performance', transactionController.getArtistPerformance);
router.post('/transactions', adminOnly, transactionController.create);
router.delete('/transactions/:id', adminOnly, transactionController.delete);

// Spesa Libera
router.get('/spesa-libera', spesaLiberaController.getAll);
router.post('/spesa-libera', adminOnly, spesaLiberaController.create);
router.delete('/spesa-libera/:id', adminOnly, spesaLiberaController.delete);

export default router;
