import { ITransactionRepository, TransactionHistoryFilters } from '../contracts/ITransactionRepository';
import { IPaginatedResponse } from '../../../shared/kernel/interfaces';
import { TransactionHistory } from '../domain/TransactionHistory';

export class ListTransactionHistory {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(page: number, limit: number, filters: TransactionHistoryFilters): Promise<IPaginatedResponse<TransactionHistory>> {
    return this.transactionRepository.findAllHistoryPaged(page, limit, filters);
  }
}
