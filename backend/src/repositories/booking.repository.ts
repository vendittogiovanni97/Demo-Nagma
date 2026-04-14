import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';
import { config } from '../config/env';

export class BookingRepository {
  private buildBaseWhere(monthStr?: string): Prisma.BookingWhereInput {
    const where: Prisma.BookingWhereInput = {
      deletedAt: null,
      // Escludi prenotazioni il cui cliente è stato soft-deleted.
      customer: { is: { deletedAt: null } },
    };
    if (monthStr) {
      const start = new Date(`${monthStr}-01T00:00:00.000Z`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      where.date = { gte: start, lt: end };
    }
    return where;
  }

  async findAll(monthStr?: string) {
    return prisma.booking.findMany({
      where: this.buildBaseWhere(monthStr),
      orderBy: { date: 'asc' },
      include: { customer: true, artist: true },
    });
  }

  async findAllPaged({
    monthStr,
    page = 1,
    limit = config.defaultPageLimit,
  }: {
    monthStr?: string;
    page?: number;
    limit?: number;
  }) {
    const where = this.buildBaseWhere(monthStr);
    const skip = (page - 1) * limit;

    const [data, total] = await prisma.$transaction([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: { customer: true, artist: true },
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async getStats(monthStr?: string) {
    const where: Prisma.BookingWhereInput = { deletedAt: null };
    if (monthStr) {
      const start = new Date(`${monthStr}-01T00:00:00.000Z`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      where.createdAt = { gte: start, lt: end }; // Dati dipendenti da creazione, non da quando viene svolto
    }

    const grouped = await prisma.booking.groupBy({
      by: ['status'],
      where,
      _count: { _all: true },
    });

    const counts = grouped.reduce<Record<string, number>>((acc, row) => {
      acc[row.status] = row._count._all;
      return acc;
    }, {});

    const confirmed = counts.CONFIRMED ?? 0;
    const cancelled = counts.CANCELLED ?? 0;
    const rescheduled = counts.RESCHEDULED ?? 0;
    const completed = counts.COMPLETED ?? 0;
    const total = confirmed + cancelled + rescheduled + completed
      + Object.entries(counts)
          .filter(([k]) => !['CONFIRMED', 'CANCELLED', 'RESCHEDULED', 'COMPLETED'].includes(k))
          .reduce((sum, [, v]) => sum + v, 0);

    return { total, confirmed, cancelled, rescheduled, completed, month: monthStr };
  }

  /**
   * Trova prenotazioni dello stesso artista che si sovrappongono all'intervallo
   * [start, start + durationMinutes). Esclude eventualmente un id (per gli update)
   * e ignora le prenotazioni cancellate o soft-deleted.
   */
  async findOverlapping(
    artistId: string,
    start: Date,
    durationMinutes: number,
    excludeId?: string
  ) {
    const end = new Date(start.getTime() + durationMinutes * 60_000);

    // Una prenotazione esistente (existingStart, existingEnd) si sovrappone
    // se existingStart < end AND existingEnd > start.
    // Poiché Prisma non ha una colonna "end", usiamo un raw query basato su
    // (date + duration*interval). Filtriamo lato DB per coerenza.
    const conflicts = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT id FROM "Booking"
      WHERE "artistId" = ${artistId}
        AND "deletedAt" IS NULL
        AND "status" <> 'CANCELLED'
        AND "date" < ${end}
        AND ("date" + (${config.defaultBookingDurationMinutes} || ' minutes')::interval) > ${start}
        ${excludeId ? Prisma.sql`AND id <> ${excludeId}` : Prisma.empty}
      LIMIT 1
    `);

    return conflicts[0] ?? null;
  }

  async create(data: Prisma.BookingCreateInput) {
    return prisma.booking.create({ data });
  }

  async update(id: string, data: Prisma.BookingUpdateInput) {
    return prisma.booking.update({ where: { id }, data });
  }

  async findById(id: string) {
    return prisma.booking.findUnique({ where: { id } });
  }

  async softDelete(id: string) {
    return prisma.booking.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}
