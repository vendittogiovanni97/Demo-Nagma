import { Prisma, Transaction, TransactionType } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { BaseRepository } from './BaseRepository';
import { config } from '../config/env';
import { getMonthRange, paginate } from '../utils/date-utils';
import prisma, { softDelete } from '../utils/prisma';
import { parseId } from '../utils/parse-id';

export class TransactionRepository extends BaseRepository<Transaction, Prisma.TransactionCreateInput, Prisma.TransactionUpdateInput> {
  constructor(prismaClient: PrismaClient = prisma) {
    super(prismaClient);
  }

  async create(data: Prisma.TransactionCreateInput): Promise<Transaction> {
    return this.prisma.transaction.create({ data });
  }

  async findById(id: string | number): Promise<Transaction | null> {
    const transactionId = parseId(String(id));
    return this.prisma.transaction.findUnique({ where: { id: transactionId } });
  }

  async findAll(): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({
      where: { deletedAt: null },
      orderBy: { date: 'desc' },
    });
  }

  async update(id: string | number, data: Prisma.TransactionUpdateInput): Promise<Transaction> {
    const transactionId = parseId(String(id));
    return this.prisma.transaction.update({ where: { id: transactionId }, data });
  }

  async delete(id: string | number): Promise<void> {
    const transactionId = parseId(String(id));
    await softDelete(this.prisma.transaction, transactionId);
  }

  async softDelete(id: string | number): Promise<void> {
    await this.delete(id);
  }

  // ============================================================================
  // SPECIALIZED METHODS - Custom business logic
  // ============================================================================

  async findAllPaged({
    type,
    monthStr,
    search,
    page = 1,
    limit = config.defaultPageLimit,
  }: {
    type?: TransactionType;
    monthStr?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const whereClause: Prisma.TransactionWhereInput = { deletedAt: null };
    if (type) whereClause.type = type;
    if (search?.trim()) {
      whereClause.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (monthStr) {
      whereClause.date = getMonthRange(monthStr);
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where: whereClause,
        ...this.buildPagination(page, limit),
        orderBy: { date: 'desc' },
      }),
      this.prisma.transaction.count({ where: whereClause }),
    ]);

    return paginate(data, total, page, limit);
  }

  async getSummary(monthStr?: string) {
    const where: Prisma.TransactionWhereInput = { deletedAt: null };
    if (monthStr) {
      where.date = getMonthRange(monthStr);
    }

    return this.prisma.transaction.groupBy({
      by: ['type'],
      where,
      _sum: { amount: true },
    });
  }

  async getTrends(months: number = 6) {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - months);

    return this.prisma.transaction.findMany({
      where: {
        deletedAt: null,
        date: { gte: start, lte: end }
      },
      select: { type: true, amount: true, date: true },
      orderBy: { date: 'asc' }
    });
  }

  async getArtistPerformance(month?: string) {
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
