import { container } from '../../core/container';
import { TransactionService } from './services/transactionService';
import { SpesaLiberaService } from './services/spesaLiberaService';
import { TransactionController } from './controllers/transaction.controller';
import { SpesaLiberaController } from './controllers/spesaLibera.controller';

export function bootstrapFinance(): void {
  const transactionService = new TransactionService();
  const spesaLiberaService = new SpesaLiberaService();

  const transactionController = new TransactionController(transactionService);
  const spesaLiberaController = new SpesaLiberaController(spesaLiberaService);

  container.register(TransactionService, transactionService);
  container.register(SpesaLiberaService, spesaLiberaService);
  container.register(TransactionController, transactionController);
  container.register(SpesaLiberaController, spesaLiberaController);
}
