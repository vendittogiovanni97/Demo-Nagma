import { TransactionRepository } from '../repositories/transaction.repository';
import { TransactionType } from '@prisma/client';
import { config } from '../config/env';
import { validate, createTransactionSchema } from '../schemas';

const repository = new TransactionRepository();

export class TransactionService {
  async getTransactions(type?: string, month?: string, search?: string, page = 1, limit = config.defaultPageLimit) {
    const enumType = type?.toUpperCase() as TransactionType | undefined;
    return repository.findAllPaged({ type: enumType, monthStr: month, search, page, limit });
  }

  async createTransaction(body: unknown) {
    const data = validate(createTransactionSchema, body);
    return repository.create({
      type: data.type as TransactionType,
      category: data.category,
      description: data.description,
      amount: data.amount,
      date: data.date ? new Date(data.date) : new Date(),
    });
  }

  async deleteTransaction(id: number) {
    return repository.softDelete(id);
  }

  async getSummary(month?: string) {
    const rows = await repository.getSummary(month);
    const result = rows.reduce((acc, row) => {
      if (row.type === 'INCOME') acc.totalIncome += row._sum.amount ?? 0;
      else acc.totalExpense += row._sum.amount ?? 0;
      return acc;
    }, { totalIncome: 0, totalExpense: 0, balance: 0 });
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
