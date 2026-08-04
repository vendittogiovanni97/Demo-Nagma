import { Express, Router } from 'express';
import { container } from '../../../core/container';
import { TransactionController } from '../controllers/transaction.controller';
import { SpesaLiberaController } from '../controllers/spesaLibera.controller';
import { EntrataLiberaController } from '../controllers/entrataLibera.controller';
import { authMiddleware, adminOnly } from '../../../core/middleware/auth.middleware';

export function registerFinanceRoutes(app: Express): void {
  const transactionController = container.get(TransactionController);
  const spesaLiberaController = container.get(SpesaLiberaController);
  const entrataLiberaController = container.get(EntrataLiberaController);
  const router = Router();

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

  // Entrate Libere
  router.get('/entrate-libere', entrataLiberaController.getAll);
  router.post('/entrate-libere', adminOnly, entrataLiberaController.create);
  router.delete('/entrate-libere/:id', adminOnly, entrataLiberaController.delete);

  app.use('/api/finance', router);
}
