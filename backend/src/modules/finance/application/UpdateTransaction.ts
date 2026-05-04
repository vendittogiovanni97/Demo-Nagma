import { ITransactionRepository } from '../contracts/ITransactionRepository';
import { CreateTransactionDTO } from '../contracts/FinanceDTOs';
import { Transaction } from '../domain/Transaction';
import { TransactionHistory } from '../domain/TransactionHistory';
import { AppError } from '../../../shared/errors/AppError';
import { financeCache } from './FinanceCache';

export class UpdateTransaction {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(id: number, data: Partial<CreateTransactionDTO> & { userId?: number }): Promise<Transaction> {
    financeCache.invalidate();
    const existing = await this.transactionRepository.findById(id);

    if (!existing) throw new AppError('Transazione non trovata', 404);

    return this.transactionRepository.executeInTransaction(async (repo) => {
      const updateData: any = {};
      if (data.type) updateData.type = data.type;
      if (data.category) updateData.category = data.category;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.amount !== undefined) updateData.amount = data.amount;
      if (data.date) updateData.date = new Date(data.date);

      const updated = await repo.update(id, updateData);

      if (data.userId) {
        await repo.addHistory(new TransactionHistory({
          transactionId: id,
          action: 'UPDATED',
          oldData: existing.toJSON(),
          newData: updated.toJSON(),
          changedById: data.userId,
        }));
      }

      return updated;
    });
  }
}
