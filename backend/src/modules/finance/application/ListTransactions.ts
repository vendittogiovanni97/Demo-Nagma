import { ITransactionRepository, TransactionFilters } from '../contracts/ITransactionRepository';
import { IPaginatedResponse } from '../../../shared/kernel/interfaces';
import { Transaction } from '../domain/Transaction';

export class ListTransactions {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(filters: TransactionFilters): Promise<IPaginatedResponse<Transaction>> {
    return this.transactionRepository.findAllPaged(filters);
  }
}
