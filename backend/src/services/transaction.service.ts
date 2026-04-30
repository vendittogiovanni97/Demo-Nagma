import { Prisma, TransactionType } from '@prisma/client';
import { createTransactionSchema, validate } from '../schemas';
import { getMonthRange, paginate, buildPagination as paginateOpts } from '../utils/date-utils';
import { mapTransactionDecimals } from '../utils/decimal-mapper';
import prisma, { softDelete } from '../utils/prisma';
import { configService } from './config.service';
import { SpesaLiberaService } from './spesa-libera.service';

const spesaLiberaService = new SpesaLiberaService();

export class TransactionService {
  async getTransactions(type?: string, month?: string, search?: string, page = 1, limit = configService.getMaxPageLimitSync()) {
    const enumType = type?.toUpperCase() as TransactionType | undefined;

    const whereClause: Prisma.TransactionWhereInput = { deletedAt: null };
    if (enumType) whereClause.type = enumType;
    if (search?.trim()) {
      whereClause.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (month) {
      whereClause.date = getMonthRange(month);
    }

    const [data, total] = await prisma.$transaction([
      prisma.transaction.findMany({
        where: whereClause,
        ...paginateOpts(page, limit),
        orderBy: { date: 'desc' },
      }),
      prisma.transaction.count({ where: whereClause }),
    ]);

    const result = paginate(data, total, page, limit);
    return { ...result, data: result.data.map(mapTransactionDecimals) };
  }

  async createTransaction(body: unknown) {
    const data = validate(createTransactionSchema, body);
    const created = await prisma.transaction.create({
      data: {
        type: data.type as TransactionType,
        category: data.category,
        description: data.description,
        amount: data.amount,
        date: data.date ? new Date(data.date) : new Date(),
      }
    });
    return mapTransactionDecimals(created);
  }

  async deleteTransaction(id: number) {
    await softDelete(prisma.transaction, id);
  }

  async getSummary(month?: string) {
    const where: Prisma.TransactionWhereInput = { deletedAt: null };
    if (month) {
      where.date = getMonthRange(month);
    }

    const rows = await prisma.transaction.groupBy({
      by: ['type'],
      where,
      _sum: { amount: true },
    });

    const result = rows.reduce((acc, row) => {
      const sum = row._sum.amount ? row._sum.amount.toNumber() : 0;
      if (row.type === 'INCOME') acc.totalIncome += sum;
      else acc.totalExpense += sum;
      return acc;
    }, { totalIncome: 0, totalExpense: 0, balance: 0 });

    // Aggiungi le spese libere al totale delle uscite
    const speseLIbere = await spesaLiberaService.findAll(month);
    const speseLibereTotalExpense = speseLIbere.reduce((sum, spesa) => sum + (typeof spesa.price === 'number' ? spesa.price : spesa.price.toNumber()), 0);
    result.totalExpense += speseLibereTotalExpense;

    result.balance = result.totalIncome - result.totalExpense;
    return result;
  }

  async getTrends(months: number = 6) {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - months);

    const raw = await prisma.transaction.findMany({
      where: {
        deletedAt: null,
        date: { gte: start, lte: end }
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

  async getArtistPerformance(month?: string) {
    const results = await prisma.$queryRaw<Array<{
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
