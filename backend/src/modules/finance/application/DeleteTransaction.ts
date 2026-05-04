import { ITransactionRepository } from '../contracts/ITransactionRepository';
import { AppError } from '../../../shared/errors/AppError';
import { TransactionHistory } from '../domain/TransactionHistory';
import { financeCache } from './FinanceCache';

export class DeleteTransaction {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(id: number, userId?: number): Promise<void> {
    financeCache.invalidate();
    const existing = await this.transactionRepository.findById(id);

    if (!existing) throw new AppError('Transazione non trovata', 404);

    return this.transactionRepository.executeInTransaction(async (repo) => {
      await repo.delete(id);

      if (userId) {
        await repo.addHistory(new TransactionHistory({
          transactionId: id,
          action: 'DELETED',
          oldData: existing.toJSON(),
          changedById: userId,
        }));
      }
    });
  }
}

