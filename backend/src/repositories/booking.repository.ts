import { Prisma, Booking } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { BaseRepository } from './BaseRepository';
import { config } from '../config/env';
import { getMonthRange, paginate } from '../utils/date-utils';
import prisma, { softDelete } from '../utils/prisma';

export class BookingRepository extends BaseRepository<Booking, Prisma.BookingCreateInput, Prisma.BookingUpdateInput> {
  constructor(prismaClient: PrismaClient = prisma) {
    super(prismaClient);
  }

  private buildBaseWhere(monthStr?: string): Prisma.BookingWhereInput {
    const where: Prisma.BookingWhereInput = {
      deletedAt: null,
      customer: { is: { deletedAt: null } },
    };
    if (monthStr) {
      where.date = getMonthRange(monthStr);
    }
    return where;
  }

  async create(data: Prisma.BookingCreateInput): Promise<Booking> {
    return this.prisma.booking.create({ data });
  }

  async findById(id: number): Promise<Booking | null> {
    return this.prisma.booking.findUnique({ where: { id } });
  }

  async findAll(monthStr?: string): Promise<Booking[]> {
    return this.prisma.booking.findMany({
      where: this.buildBaseWhere(monthStr),
      orderBy: { date: 'asc' },
      include: { customer: true, artist: true },
    });
  }

  async update(id: number, data: Prisma.BookingUpdateInput): Promise<Booking> {
    return this.prisma.booking.update({ where: { id }, data });
  }

  async delete(id: number): Promise<void> {
    await softDelete(this.prisma.booking, id);
  }

  // ============================================================================
  // SPECIALIZED METHODS - Custom business logic
  // ============================================================================

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

    const [data, total] = await this.prisma.$transaction([
      this.prisma.booking.findMany({
        where,
        ...this.buildPagination(page, limit),
        orderBy: { date: 'desc' },
        include: { customer: true, artist: true },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return paginate(data, total, page, limit);
  }

  async getStats(monthStr?: string) {
    const where: Prisma.BookingWhereInput = { deletedAt: null };
    if (monthStr) {
      where.date = getMonthRange(monthStr);
    }

    const grouped = await this.prisma.booking.groupBy({
      by: ['status'],
      where,
      _count: { _all: true },
    });

    const counts = grouped.reduce<Record<string, number>>((acc, row) => {
      acc[row.status] = row._count._all;
      return acc;
    }, {});

    return {
      total: Object.values(counts).reduce((sum, v) => sum + v, 0),
      confirmed: counts.CONFIRMED ?? 0,
      cancelled: counts.CANCELLED ?? 0,
      rescheduled: counts.RESCHEDULED ?? 0,
      completed: counts.COMPLETED ?? 0,
      month: monthStr,
    };
  }

  async findOverlapping(
    artistId: number,
    start: Date,
    durationMinutes: number,
    excludeId?: number
  ) {
    const end = new Date(start.getTime() + durationMinutes * 60_000);

    const conflicts = await this.prisma.$queryRaw<Array<{ id: number }>>(Prisma.sql`
      SELECT id FROM "Booking"
      WHERE "artistId" = ${artistId}
        AND "deletedAt" IS NULL
        AND "status" <> 'CANCELLED'
        AND "date" < ${end}
        AND ("date" + ("duration" || ' minutes')::interval) > ${start}
        ${excludeId ? Prisma.sql`AND id <> ${excludeId}` : Prisma.empty}
      LIMIT 1
    `);

    return conflicts[0] ?? null;
  }

  async findWithFilters(where: Prisma.BookingWhereInput) {
    return this.prisma.booking.findMany({
      where,
      orderBy: { date: 'asc' },
      include: { customer: true, artist: true },
    });
  }
}
