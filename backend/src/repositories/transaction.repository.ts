import prisma from '../utils/prisma';
import { Prisma, TransactionType } from '@prisma/client';

export class TransactionRepository {
  async findAll(type?: TransactionType, monthStr?: string) {
    const whereClause: Prisma.TransactionWhereInput = { deletedAt: null };
    if (type) whereClause.type = type;

    // Filtro mese basico, es: '2026-03'
    if (monthStr) {
      const start = new Date(`${monthStr}-01T00:00:00.000Z`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      whereClause.date = { gte: start, lt: end };
    }

    return prisma.transaction.findMany({
      where: whereClause,
      orderBy: { date: 'desc' }
    });
  }

  async create(data: Prisma.TransactionCreateInput) {
    return prisma.transaction.create({ data });
  }

  async softDelete(id: string) {
    return prisma.transaction.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  async getSummary(monthStr?: string) {
    const dove: Prisma.TransactionWhereInput = { deletedAt: null };
    if (monthStr) {
      const start = new Date(`${monthStr}-01T00:00:00.000Z`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      dove.date = { gte: start, lt: end };
    }

    const res = await prisma.transaction.groupBy({
      by: ['type'],
      where: dove,
      _sum: {
        amount: true
      }
    });
    return res;
  }

  async getTrends(months: number = 6) {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - months);

    return prisma.transaction.findMany({
      where: {
        deletedAt: null,
        date: { gte: start, lte: end }
      },
      select: {
        type: true,
        amount: true,
        date: true
      },
      orderBy: { date: 'asc' }
    });
  }

  async getArtistPerformance() {
    const stats = await prisma.booking.groupBy({
      by: ['artistId'],
      where: {
        deletedAt: null,
        status: 'COMPLETED'
      },
      _count: {
        id: true
      },
      _sum: {
        price: true
      }
    });

    // Arricchisci con i nomi degli artisti
    const artistIds = stats.map(s => s.artistId);
    const artists = await prisma.user.findMany({
      where: { id: { in: artistIds } },
      select: { id: true, name: true, color: true },
    });
    const artistMap = Object.fromEntries(artists.map(a => [a.id, a]));

    return stats.map(s => ({
      artistId: s.artistId,
      artistName: artistMap[s.artistId]?.name ?? 'Sconosciuto',
      artistColor: artistMap[s.artistId]?.color ?? null,
      bookings: s._count.id,
      revenue: s._sum.price ?? 0,
    }));
  }
}
