import { ITransactionRepository } from '../contracts/ITransactionRepository';
import { ISpesaLiberaRepository } from '../contracts/ISpesaLiberaRepository';
import { FinanceSummaryDTO } from '../contracts/FinanceDTOs';
import { financeCache } from './FinanceCache';

export class GetFinanceSummary {
  constructor(
    private transactionRepository: ITransactionRepository,
    private spesaLiberaRepository: ISpesaLiberaRepository
  ) {}

  async execute(month?: string): Promise<FinanceSummaryDTO> {
    const cacheKey = `summary_${month || 'all'}`;
    const cached = financeCache.get(cacheKey);
    if (cached) return cached;

    const transactionSummary = await this.transactionRepository.getSummary(month);
    
    // Every "Spesa Libera" is already registered as a transaction in the database upon creation,
    // so transactionSummary.totalExpense already includes all "Spese Libere".
    // Adding speseLibereTotalExpense here was causing a double-expense counting bug!
    const totalIncome = transactionSummary.totalIncome;
    const totalExpense = transactionSummary.totalExpense;

    const result = {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };

    financeCache.set(cacheKey, result);
    return result;
  }
}

