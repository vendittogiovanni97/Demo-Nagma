import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

export class BookingRepository {
  async findAll(monthStr?: string) {
    const where: Prisma.BookingWhereInput = { deletedAt: null };
    if (monthStr) {
      const start = new Date(`${monthStr}-01T00:00:00.000Z`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      where.date = { gte: start, lt: end };
    }
    return prisma.booking.findMany({
      where,
      orderBy: { date: 'asc' },
      include: { customer: true, artist: true }
    });
  }

  async getStats(monthStr?: string) {
    const where: Prisma.BookingWhereInput = { deletedAt: null };
    if (monthStr) {
      const start = new Date(`${monthStr}-01T00:00:00.000Z`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      where.createdAt = { gte: start, lt: end }; // Dati dipendenti da creazione, non da quando viene svolto
    }
    
    const all = await prisma.booking.findMany({ where, select: { status: true } });
    const total = all.length;
    const confirmed = all.filter(b => b.status === 'CONFIRMED').length;
    const cancelled = all.filter(b => b.status === 'CANCELLED').length;
    const rescheduled = all.filter(b => b.status === 'RESCHEDULED').length;
    const completed = all.filter(b => b.status === 'COMPLETED').length;

    return { total, confirmed, cancelled, rescheduled, completed, month: monthStr };
  }

  async create(data: Prisma.BookingCreateInput) {
    return prisma.booking.create({ data });
  }

  async update(id: string, data: Prisma.BookingUpdateInput) {
    return prisma.booking.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return prisma.booking.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}
