import { PrismaClient, Prisma, TransactionType as PrismaTransactionType } from '@prisma/client';
import { ITransactionRepository, TransactionFilters } from '../contracts/ITransactionRepository';
import { Transaction, TransactionType } from '../domain/Transaction';
import { IPaginatedResponse } from '../../../shared/kernel/interfaces';
import { paginate, buildPagination } from '../../../shared/kernel/pagination';
import { getMonthRange } from '../../../shared/utils/date-utils';
import prismaClient, { softDelete } from '../../../shared/utils/prisma';

export class PrismaTransactionRepository implements ITransactionRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prismaClient;
  }

  private mapToDomain(raw: any): Transaction {
    return new Transaction({
      id: raw.id,
      type: raw.type as TransactionType,
      category: raw.category,
      description: raw.description,
      amount: raw.amount,
      date: raw.date,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }

  async findAllPaged(filters: TransactionFilters): Promise<IPaginatedResponse<Transaction>> {
    const { type, month, search, page = 1, limit = 20 } = filters;
    const where: Prisma.TransactionWhereInput = { deletedAt: null };

    if (type) where.type = type as PrismaTransactionType;
    if (search?.trim()) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (month) where.date = getMonthRange(month);

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

  async delete(id: number): Promise<void> {
    await softDelete(this.prisma.transaction, id);
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
        AND b.status = 'COMPLETED'
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
}
