import { Prisma, Transaction, TransactionType } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { BaseRepository } from './BaseRepository';
import { config } from '../config/env';
import { getMonthRange, paginate } from '../utils/date-utils';
import prisma, { softDelete } from '../utils/prisma';

export class TransactionRepository extends BaseRepository<Transaction, Prisma.TransactionCreateInput, Prisma.TransactionUpdateInput> {
  constructor(prismaClient: PrismaClient = prisma) {
    super(prismaClient);
  }

  async create(data: Prisma.TransactionCreateInput): Promise<Transaction> {
    return this.prisma.transaction.create({ data });
  }

  async findById(id: string | number): Promise<Transaction | null> {
    const transactionId = typeof id === 'number' ? id : parseInt(id, 10);
    return this.prisma.transaction.findUnique({ where: { id: transactionId } });
  }

  async findAll(): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({
      where: { deletedAt: null },
      orderBy: { date: 'desc' },
    });
  }

  async update(id: string | number, data: Prisma.TransactionUpdateInput): Promise<Transaction> {
    const transactionId = typeof id === 'number' ? id : parseInt(id, 10);
    return this.prisma.transaction.update({ where: { id: transactionId }, data });
  }

  async delete(id: string | number): Promise<void> {
    const transactionId = typeof id === 'number' ? id : parseInt(id, 10);
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

    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where: whereClause,
        skip,
        take: limit,
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

  async getArtistPerformance() {
    const stats = await this.prisma.booking.groupBy({
      by: ['artistId'],
      where: { deletedAt: null, status: 'COMPLETED' },
      _count: { id: true },
      _sum: { price: true },
    });

    const artistIds = stats.map(s => s.artistId).filter((id): id is number => id !== null);
    const artists = await this.prisma.staff.findMany({
      where: { id: { in: artistIds } },
      select: { id: true, name: true, color: true },
    });
    const artistMap = Object.fromEntries(artists.map(a => [a.id, a]));

    return stats.map(s => ({
      artistId: s.artistId,
      artistName: s.artistId ? (artistMap[s.artistId]?.name ?? 'Sconosciuto') : 'Sconosciuto',
      artistColor: s.artistId ? (artistMap[s.artistId]?.color ?? null) : null,
      bookings: s._count.id,
      revenue: s._sum.price ?? 0,
    }));
  }
}
