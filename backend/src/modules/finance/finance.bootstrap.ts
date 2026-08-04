import { container } from '../../core/container';
import { TransactionService } from './services/transactionService';
import { SpesaLiberaService } from './services/spesaLiberaService';
import { EntrataLiberaService } from './services/entrataLiberaService';
import { TransactionController } from './controllers/transaction.controller';
import { SpesaLiberaController } from './controllers/spesaLibera.controller';
import { EntrataLiberaController } from './controllers/entrataLibera.controller';

export function bootstrapFinance(): void {
  const transactionService = new TransactionService();
  const spesaLiberaService = new SpesaLiberaService();
  const entrataLiberaService = new EntrataLiberaService();

  const transactionController = new TransactionController(transactionService);
  const spesaLiberaController = new SpesaLiberaController(spesaLiberaService);
  const entrataLiberaController = new EntrataLiberaController(entrataLiberaService);

  container.register(TransactionService, transactionService);
  container.register(SpesaLiberaService, spesaLiberaService);
  container.register(EntrataLiberaService, entrataLiberaService);
  container.register(TransactionController, transactionController);
  container.register(SpesaLiberaController, spesaLiberaController);
  container.register(EntrataLiberaController, entrataLiberaController);
}
