import { TransactionRepository } from '../repositories/transaction.repository';
import { TransactionType } from '@prisma/client';

export class TransactionService {
  private repository: TransactionRepository;

  constructor() {
    this.repository = new TransactionRepository();
  }

  async getTransactions(type?: string, monthStr?: string) {
    const enumType = type?.toUpperCase() as TransactionType | undefined;
    return this.repository.findAll(enumType, monthStr);
  }

  async createTransaction(data: { type: string, category: string, description: string, amount: number, date?: string }) {
    if (!data.type || !data.amount || !data.description) {
      throw new Error('Type, Amount, Description required');
    }
    const typeEnum = data.type.toUpperCase() as TransactionType;
    if (typeEnum !== 'INCOME' && typeEnum !== 'EXPENSE') throw new Error('Invalid type: Must be INCOME or EXPENSE');

    return this.repository.create({
      type: typeEnum,
      category: data.category || 'Generale',
      description: data.description,
      amount: Number(data.amount),
      date: data.date ? new Date(data.date) : new Date()
    });
  }

  async deleteTransaction(id: string) {
    return this.repository.softDelete(id);
  }

  async getSummary(monthStr?: string) {
    const summary = await this.repository.getSummary(monthStr);
    const result = { totalIncome: 0, totalExpense: 0, balance: 0 };
    summary.forEach((s: any) => {
      if (s.type === 'INCOME') result.totalIncome = s._sum.amount || 0;
      if (s.type === 'EXPENSE') result.totalExpense = s._sum.amount || 0;
    });
    result.balance = result.totalIncome - result.totalExpense;
    return result;
  }

  async getTrends(months: number = 6) {
    const raw = await this.repository.getTrends(months);
    // Raggruppamento per mese in JS per semplicità di risposta
    const trends: Record<string, { income: number, expense: number }> = {};
    
    raw.forEach(t => {
      const month = t.date.toISOString().substring(0, 7); // YYYY-MM
      if (!trends[month]) trends[month] = { income: 0, expense: 0 };
      if (t.type === 'INCOME') trends[month].income += t.amount;
      else trends[month].expense += t.amount;
    });

    return Object.entries(trends).map(([month, data]) => ({
      month,
      ...data
    })).sort((a, b) => a.month.localeCompare(b.month));
  }

  async getArtistPerformance() {
    return this.repository.getArtistPerformance();
  }
}
