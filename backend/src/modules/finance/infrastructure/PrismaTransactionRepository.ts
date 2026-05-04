import { PrismaClient, Prisma, TransactionType as PrismaTransactionType } from '@prisma/client';
import { ITransactionRepository, TransactionFilters, TransactionHistoryFilters } from '../contracts/ITransactionRepository';
import { Transaction, TransactionType } from '../domain/Transaction';
import { TransactionHistory } from '../domain/TransactionHistory';
import { IPaginatedResponse } from '../../../shared/kernel/interfaces';
import { paginate, buildPagination } from '../../../shared/kernel/pagination';
import { getMonthRange } from '../../../shared/utils/date-utils';
import prismaClient, { softDelete } from '../../../shared/utils/prisma';

export class PrismaTransactionRepository implements ITransactionRepository {
  private prisma: PrismaClient;

  constructor(tx?: any) {
    this.prisma = tx || prismaClient;
  }

  private mapToDomain(raw: any): Transaction {
    return new Transaction({
      id: raw.id,
      type: raw.type as TransactionType,
      category: raw.category,
      description: raw.description,
      amount: Number(raw.amount),
      date: raw.date,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }

  private mapHistoryToDomain(raw: any): TransactionHistory {
    const history = new TransactionHistory({
      id: raw.id,
      transactionId: raw.transactionId,
      action: raw.action,
      oldData: raw.oldData,
      newData: raw.newData,
      changedById: raw.changedById,
      changedAt: raw.changedAt,
    });

    if (raw.changedBy) history.changedBy = raw.changedBy;
    if (raw.transaction) history.transaction = raw.transaction;

    return history;
  }



  async findById(id: number): Promise<Transaction | null> {
    const raw = await this.prisma.transaction.findUnique({
      where: { id },
    });
    return raw ? this.mapToDomain(raw) : null;
  }

  async findAllPaged(filters: TransactionFilters): Promise<IPaginatedResponse<Transaction>> {
    const { type, month, startDate, endDate, search, page = 1, limit = 20 } = filters;
    const where: Prisma.TransactionWhereInput = { deletedAt: null };

    if (type) where.type = type as PrismaTransactionType;
    if (search?.trim()) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (month) {
      where.date = getMonthRange(month);
    } else {
      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate);
        if (endDate) where.date.lte = new Date(endDate + 'T23:59:59');
      }
    }

    const [raws, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where,
        ...buildPagination(page, limit),
        orderBy: { date: 'desc' },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return paginate(raws.map(this.mapToDomain), total, page, limit);
  }

  async create(transaction: Transaction): Promise<Transaction> {
    const data = transaction.toJSON();
    const created = await this.prisma.transaction.create({
      data: {
        type: data.type as PrismaTransactionType,
        category: data.category,
        description: data.description ?? '',
        amount: data.amount,
        date: data.date,
      },
    });
    return this.mapToDomain(created);
  }

  async update(id: number, data: Partial<Transaction>): Promise<Transaction> {
    const updated = await this.prisma.transaction.update({
      where: { id },
      data: data as any,
    });
    return this.mapToDomain(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.transaction.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async addHistory(history: TransactionHistory): Promise<void> {
    const data = history.toJSON();
    await this.prisma.transactionHistory.create({
      data: {
        transactionId: data.transactionId,
        action: data.action,
        oldData: data.oldData as any,
        newData: data.newData as any,
        changedById: data.changedById,
      },
    });
  }

  async findAllHistoryPaged(page: number, limit: number, filters: TransactionHistoryFilters): Promise<IPaginatedResponse<TransactionHistory>> {
    const { transactionId, changedById, startDate, endDate, action } = filters;
    const where: Prisma.TransactionHistoryWhereInput = {};

    if (transactionId) where.transactionId = transactionId;
    if (changedById) where.changedById = changedById;
    if (action) where.action = action;

    if (startDate || endDate) {
      where.changedAt = {};
      if (startDate) where.changedAt.gte = new Date(startDate);
      if (endDate) where.changedAt.lte = new Date(endDate + 'T23:59:59');
    }

    const [raws, total] = await this.prisma.$transaction([
      this.prisma.transactionHistory.findMany({
        where,
        ...buildPagination(page, limit),
        orderBy: { changedAt: 'desc' },
        include: {
          changedBy: { select: { id: true, name: true } },
          transaction: { select: { id: true, description: true, type: true } }
        }
      }),
      this.prisma.transactionHistory.count({ where }),
    ]);

    return paginate(raws.map(this.mapHistoryToDomain), total, page, limit);
  }

  async getSummary(month?: string): Promise<{ totalIncome: number; totalExpense: number }> {
    const where: Prisma.TransactionWhereInput = { deletedAt: null };
    if (month) where.date = getMonthRange(month);

    const rows = await this.prisma.transaction.groupBy({
      by: ['type'],
      where,
      _sum: { amount: true },
    });

    return rows.reduce((acc, row) => {
      const sum = row._sum.amount ? row._sum.amount.toNumber() : 0;
      if (row.type === 'INCOME') acc.totalIncome += sum;
      else acc.totalExpense += sum;
      return acc;
    }, { totalIncome: 0, totalExpense: 0 });
  }

  async getTrends(startDate: Date, endDate: Date): Promise<Array<{ month: string; income: number; expense: number }>> {
    const raw = await this.prisma.transaction.findMany({
      where: {
        deletedAt: null,
        date: { gte: startDate, lte: endDate }
      },
      select: { type: true, amount: true, date: true },
      orderBy: { date: 'asc' }
    });

    const map: Record<string, { income: number; expense: number }> = {};
    raw.forEach(t => {
      const monthStr = t.date.toISOString().substring(0, 7);
      if (!map[monthStr]) map[monthStr] = { income: 0, expense: 0 };
      const amount = t.amount.toNumber();
      if (t.type === 'INCOME') map[monthStr].income += amount;
      else map[monthStr].expense += amount;
    });

    return Object.entries(map)
      .map(([m, data]) => ({ month: m, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  async getArtistPerformance(month?: string): Promise<Array<{ artistId: number; artistName: string; artistColor: string | null; bookings: number; revenue: number }>> {
    const results = await this.prisma.$queryRaw<Array<{
      artistId: number;
      artistName: string;
      artistColor: string | null;
      bookings: bigint;
      revenue: number | null;
    }>>`
      SELECT
        s.id            AS "artistId",
        s.name          AS "artistName",
        s.color         AS "artistColor",
        COUNT(b.id)     AS bookings,
        SUM(b.price)    AS revenue
      FROM "Staff" s
      LEFT JOIN "Booking" b
        ON b."artistId" = s.id
        AND b."deletedAt" IS NULL
        AND b.status = 'COMPLETATO'
        ${month ? Prisma.sql`AND DATE_TRUNC('month', b.date) = DATE_TRUNC('month', ${month + '-01'}::date)` : Prisma.empty}
      GROUP BY s.id, s.name, s.color
      ORDER BY revenue DESC NULLS LAST
    `;

    return results.map(r => ({
      artistId: r.artistId,
      artistName: r.artistName ?? 'Sconosciuto',
      artistColor: r.artistColor ?? null,
      bookings: Number(r.bookings),
      revenue: r.revenue ? Number(r.revenue) : 0,
    }));
  }

  async executeInTransaction<T>(work: (repo: ITransactionRepository, tx: any) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      const transactionalRepo = new PrismaTransactionRepository(tx);
      return work(transactionalRepo, tx);
    });
  }
}

