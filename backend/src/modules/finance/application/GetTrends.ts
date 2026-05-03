import { ITransactionRepository } from '../contracts/ITransactionRepository';

export class GetTrends {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(months: number = 6): Promise<Array<{ month: string; income: number; expense: number }>> {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - months);

    return this.transactionRepository.getTrends(start, end);
  }
}
