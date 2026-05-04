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
    const speseLibere = await this.spesaLiberaRepository.findAll(month);
    
    const speseLibereTotalExpense = speseLibere.reduce((sum, spesa) => {
      const price = spesa.toJSON().price;
      return sum + price;
    }, 0);

    const totalIncome = transactionSummary.totalIncome;
    const totalExpense = transactionSummary.totalExpense + speseLibereTotalExpense;

    const result = {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };

    financeCache.set(cacheKey, result);
    return result;
  }
}

