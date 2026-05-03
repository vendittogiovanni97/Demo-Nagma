import { ITransactionRepository } from '../contracts/ITransactionRepository';
import { CreateTransactionDTO } from '../contracts/FinanceDTOs';
import { Transaction } from '../domain/Transaction';

export class CreateTransaction {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(data: CreateTransactionDTO): Promise<Transaction> {
    const transaction = new Transaction({
      type: data.type,
      category: data.category,
      description: data.description,
      amount: data.amount,
      date: data.date ? new Date(data.date) : new Date(),
    });
    return this.transactionRepository.create(transaction);
  }
}
