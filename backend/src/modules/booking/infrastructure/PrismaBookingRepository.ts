import { Prisma, PrismaClient } from '@prisma/client';
import { IPaginatedResponse } from '../../../shared/kernel/interfaces';
import { buildPagination, paginate } from '../../../shared/kernel/pagination';
import { getMonthRange } from '../../../shared/utils/date-utils';
import prismaClient from '../../../shared/utils/prisma';
import { BookingFilters, IBookingRepository, BookingHistoryFilters } from '../contracts/IBookingRepository';
import { Booking } from '../domain/Booking';
import { BookingHistory } from '../domain/BookingHistory';

export class PrismaBookingRepository implements IBookingRepository {
  private prisma: PrismaClient;

  constructor(tx?: any) {
    this.prisma = tx || prismaClient;
  }

  private mapToDomain(raw: any): Booking {
    return new Booking({
      id: raw.id,
      customerId: raw.customerId,
      artistId: raw.artistId,
      date: raw.date,
      duration: raw.duration,
      status: raw.status as any,
      price: raw.price ? Number(raw.price) : null,
      deposit: raw.deposit ? Number(raw.deposit) : null,
      notes: raw.notes || null,
      formData: raw.formData,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
      customer: raw.customer || null,
      artist: raw.artist || null,
    });
  }

  private mapHistoryToDomain(raw: any): BookingHistory {
    return new BookingHistory({
      id: raw.id,
      bookingId: raw.bookingId,
      action: raw.action,
      oldDate: raw.oldDate,
      newDate: raw.newDate,
      changedById: raw.changedById,
      changedAt: raw.changedAt,
      booking: raw.booking || null,
      changedBy: raw.changedBy || null,
    });
  }

  async save(booking: Booking): Promise<Booking> {
    const data = booking.toJSON();
    const created = await this.prisma.booking.create({
      data: {
        customerId: data.customerId,
        artistId: data.artistId,
        date: data.date,
        duration: data.duration,
        status: data.status,
        price: data.price,
        deposit: data.deposit,
        notes: data.notes,
        formData: data.formData as any,
      },
      include: { customer: true, artist: true },
    });
    return this.mapToDomain(created);
  }

  async findById(id: number): Promise<Booking | null> {
    const raw = await this.prisma.booking.findUnique({
      where: { id },
      include: { customer: true, artist: true },
    });
    return raw ? this.mapToDomain(raw) : null;
  }

  async findAllPaged(filters: BookingFilters): Promise<IPaginatedResponse<Booking>> {
    const { month, startDate, endDate, page = 1, limit = 20 } = filters;
    const where: Prisma.BookingWhereInput = {
      deletedAt: null,
      customer: { is: { deletedAt: null } },
    };

    if (month) {
      where.date = getMonthRange(month);
    } else {
      if (startDate) {
        where.date = { gte: new Date(startDate) };
      }
      if (endDate) {
        where.date = { ...where.date as object, lte: new Date(endDate + 'T23:59:59.999') };
      }
    }

    const [raws, total] = await this.prisma.$transaction([
      this.prisma.booking.findMany({
        where,
        ...buildPagination(page, limit),
        orderBy: { date: 'desc' },
        include: { customer: true, artist: true },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return paginate(raws.map(this.mapToDomain), total, page, limit);
  }

  async findAllSimple(filters: BookingFilters): Promise<{ data: Booking[], total: number, hasMore: boolean }> {
    const { month, startDate, endDate, limit, offset } = filters;
    const where: Prisma.BookingWhereInput = {
      deletedAt: null,
      customer: { is: { deletedAt: null } },
    };

    if (month) {
      where.date = getMonthRange(month);
    } else {
      if (startDate) {
        where.date = { gte: new Date(startDate) };
      }
      if (endDate) {
        where.date = { ...where.date as object, lte: new Date(endDate + 'T23:59:59.999') };
      }
    }

    const [raws, total] = await this.prisma.$transaction([
      this.prisma.booking.findMany({
        where,
        orderBy: { date: 'asc' },
        include: { customer: true, artist: true },
        ...(limit && { take: limit }),
        ...(offset && { skip: offset }),
      }),
      this.prisma.booking.count({ where }),
    ]);

    const hasMore = limit ? (offset ?? 0) + raws.length < total : false;
    return { data: raws.map(this.mapToDomain), total, hasMore };
  }

  async update(id: number, data: Partial<Booking>): Promise<Booking> {
    const updated = await this.prisma.booking.update({
      where: { id },
      data: data as any,
      include: { customer: true, artist: true },
    });
    return this.mapToDomain(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.booking.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async addHistory(history: BookingHistory): Promise<void> {
    const data = history.toJSON();
    await this.prisma.bookingHistory.create({
      data: {
        bookingId: data.bookingId,
        action: data.action as any,
        oldDate: data.oldDate,
        newDate: data.newDate,
        changedById: data.changedById,
      },
    });
  }

  async getHistory(bookingId: number): Promise<BookingHistory[]> {
    const raws = await this.prisma.bookingHistory.findMany({
      where: { bookingId },
      orderBy: { changedAt: 'desc' },
    });
    return raws.map(this.mapHistoryToDomain);
  }

  async findAllHistoryPaged(page: number, limit: number, filters: BookingHistoryFilters): Promise<IPaginatedResponse<BookingHistory>> {
    const { startDate, endDate, action, userId, artistId, search } = filters;
    const where: Prisma.BookingHistoryWhereInput = {};

    if (startDate || endDate) {
      where.changedAt = {};
      if (startDate) where.changedAt.gte = new Date(startDate);
      if (endDate) where.changedAt.lte = new Date(endDate + 'T23:59:59');
    }

    if (action) where.action = action as any;
    if (userId) where.changedById = userId;

    if (artistId || search) {
      where.booking = {
        ...(artistId ? { artistId } : {}),
        ...(search ? {
          customer: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search } },
            ]
          }
        } : {})
      };
    }

    const [raws, total] = await this.prisma.$transaction([
      this.prisma.bookingHistory.findMany({
        where,
        ...buildPagination(page, limit),
        orderBy: { changedAt: 'desc' },
        include: {
          booking: {
            include: {
              customer: true,
              artist: true,
            }
          },
          changedBy: {
            select: { id: true, name: true, email: true }
          }
        }
      }),
      this.prisma.bookingHistory.count({ where }),
    ]);

    return paginate(raws.map(this.mapHistoryToDomain), total, page, limit);
  }

  async getStats(month?: string): Promise<any> {
    const where: Prisma.BookingWhereInput = { deletedAt: null };
    if (month) {
      where.date = getMonthRange(month);
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
      confirmed: counts.CONFERMATO ?? 0,
      cancelled: counts.CANCELLATO ?? counts.ANNULLATO ?? 0,
      rescheduled: counts.SPOSTATO ?? 0,
      completed: counts.COMPLETATO ?? 0,
      month: month,
    };
  }

  async getAvailableArtists(start: Date, end: Date): Promise<any[]> {
    const busyRows = await this.prisma.$queryRaw<Array<{ artistId: number }>>(Prisma.sql`
      SELECT DISTINCT "artistId" FROM "Booking"
      WHERE "deletedAt" IS NULL
        AND "status" <> 'CANCELLATO'
        AND "artistId" IS NOT NULL
        AND "date" < ${end}
        AND ("date" + ("duration" || ' minutes')::interval) > ${start}
    `);

    const busyIds = new Set(busyRows.map(r => r.artistId));

    const allStaff = await this.prisma.staff.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, color: true },
      orderBy: { name: 'asc' },
    });

    return allStaff.filter(s => !busyIds.has(s.id));
  }

  async hasConflict(artistId: number, start: Date, end: Date, excludeId?: number): Promise<number | null> {
    const conflicts = await this.prisma.$queryRaw<Array<{ id: number }>>(Prisma.sql`
      SELECT id FROM "Booking"
      WHERE "artistId" = ${artistId}
        AND "deletedAt" IS NULL
        AND "status" <> 'CANCELLATO'
        AND "date" < ${end}
        AND ("date" + ("duration" || ' minutes')::interval) > ${start}
        ${excludeId ? Prisma.sql`AND id <> ${excludeId}` : Prisma.empty}
      LIMIT 1
    `);

    return conflicts[0]?.id ?? null;
  }

  async executeInTransaction<T>(work: (repo: IBookingRepository, tx: any) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      const transactionalRepo = new PrismaBookingRepository(tx);
      return work(transactionalRepo, tx);
    });
  }
}
