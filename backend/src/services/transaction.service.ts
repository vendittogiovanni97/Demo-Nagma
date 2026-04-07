import { TransactionRepository } from '../repositories/transaction.repository';
import { TransactionType } from '@prisma/client';
import { validate, CreateTransactionSchema } from '../utils/validators';

const repository = new TransactionRepository();

export class TransactionService {
  async getTransactions(type?: string, month?: string) {
    const enumType = type?.toUpperCase() as TransactionType | undefined;
    return repository.findAll(enumType, month);
  }

  async createTransaction(body: unknown) {
    const data = validate(CreateTransactionSchema, body);
    return repository.create({
      type: data.type as TransactionType,
      category: data.category,
      description: data.description,
      amount: data.amount,
      date: data.date ? new Date(data.date) : new Date(),
    });
  }

  async deleteTransaction(id: string) {
    return repository.softDelete(id);
  }

  async getSummary(month?: string) {
    const rows = await repository.getSummary(month);
    const result = { totalIncome: 0, totalExpense: 0, balance: 0 };
    rows.forEach((row: any) => {
      if (row.type === 'INCOME') result.totalIncome = row._sum.amount ?? 0;
      if (row.type === 'EXPENSE') result.totalExpense = row._sum.amount ?? 0;
    });
    result.balance = result.totalIncome - result.totalExpense;
    return result;
  }

  async getTrends(months: number = 6) {
    const raw = await repository.getTrends(months);
    const map: Record<string, { income: number; expense: number }> = {};

    raw.forEach(t => {
      const month = t.date.toISOString().substring(0, 7);
      if (!map[month]) map[month] = { income: 0, expense: 0 };
      if (t.type === 'INCOME') map[month].income += t.amount;
      else map[month].expense += t.amount;
    });

    return Object.entries(map)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  async getArtistPerformance() {
    return repository.getArtistPerformance();
  }
}
