import { ITransactionRepository } from '../contracts/ITransactionRepository';
import { CreateTransactionDTO } from '../contracts/FinanceDTOs';
import { Transaction } from '../domain/Transaction';
import { TransactionHistory } from '../domain/TransactionHistory';
import { financeCache } from './FinanceCache';

export class CreateTransaction {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(data: CreateTransactionDTO & { userId?: number }): Promise<Transaction> {
    financeCache.invalidate();
    return this.transactionRepository.executeInTransaction(async (repo) => {
      const transaction = new Transaction({
        type: data.type,
        category: data.category,
        description: data.description,
        amount: data.amount,
        date: data.date ? new Date(data.date) : new Date(),
      });

      const created = await repo.create(transaction);

      if (data.userId && created.id) {
        await repo.addHistory(new TransactionHistory({
          transactionId: created.id,
          action: 'CREATED',
          newData: created.toJSON(),
          changedById: data.userId,
        }));
      }

      return created;
    });
  }
}

