import { ITransactionRepository } from '../contracts/ITransactionRepository';
import { financeCache } from './FinanceCache';

export class GetTrends {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(months: number = 6): Promise<Array<{ month: string; income: number; expense: number }>> {
    const cacheKey = `trends_${months}`;
    const cached = financeCache.get(cacheKey);
    if (cached) return cached;

    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - months);

    const result = await this.transactionRepository.getTrends(start, end);
    financeCache.set(cacheKey, result);
    return result;
  }
}

