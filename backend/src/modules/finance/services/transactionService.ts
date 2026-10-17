import { Prisma, TransactionType } from '@prisma/client';
import prisma from '../../../core/shared/utils/prisma';
import { AppError } from '../../../core/shared/errors/AppError';
import { paginate, buildPagination } from '../../../core/shared/kernel/pagination';
import { buildDateFilter } from '../../../core/shared/utils/date-utils';
import { financeCache } from './finance.cache';

/** Le colonne Json di TransactionHistory accettano InputJsonValue; i record Prisma
 *  (con Decimal/Date) vengono serializzati correttamente al momento della scrittura. */
const toJsonInput = (value: unknown): Prisma.InputJsonValue => value as Prisma.InputJsonValue;

const BOOKING_SOURCE_TYPES = ['BOOKING', 'BOOKING_DEPOSIT'];

export interface BookingInfo {
  artistName: string | null;
  notes: string | null;
  formData: unknown;
}

/**
 * Percentuale studio di una prenotazione. Nel formData è salvata la quota dell'artista
 * (`percentualeMode`): la quota studio è il suo complemento a 100.
 */
export function studioPercentageOf(formData: unknown): number | null {
  const fd = (formData ?? {}) as Record<string, unknown>;
  const artistPercent = Number(fd.percentualeMode ?? fd.artistPercentage);
  if (fd.percentualeMode == null && fd.artistPercentage == null) return null;
  if (!Number.isFinite(artistPercent)) return null;
  return Math.min(100, Math.max(0, 100 - artistPercent));
}

/** Aggiunge a ogni movimento legato a una prenotazione artista, % studio e note. */
export function withBookingInfo<T extends { amount: unknown; sourceId: number | null; sourceType: string | null }>(
  rows: T[],
  bookings: Map<number, BookingInfo>,
) {
  return rows.map((row) => {
    const booking = row.sourceType && BOOKING_SOURCE_TYPES.includes(row.sourceType) && row.sourceId
      ? bookings.get(row.sourceId)
      : undefined;
    return {
      ...row,
      amount: Number(row.amount),
      artistName: booking?.artistName ?? null,
      studioPercentage: booking ? studioPercentageOf(booking.formData) : null,
      bookingNotes: booking?.notes ?? null,
    };
  });
}

export class TransactionService {
  async findAll(filters: {
    type?: string;
    category?: string;
    month?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { type, category, month, startDate, endDate, search, page = 1, limit = 25 } = filters;
    const where: Prisma.TransactionWhereInput = { deletedAt: null };

    if (type) where.type = type as TransactionType;
    if (category) where.category = category;
    if (search?.trim()) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }
    const dateFilter = buildDateFilter(month, startDate, endDate);
    if (dateFilter) {
      where.date = dateFilter;
    }

    const [raws, total] = await prisma.$transaction([
      prisma.transaction.findMany({
        where,
        ...buildPagination(page, limit),
        orderBy: { date: 'desc' },
      }),
      prisma.transaction.count({ where }),
    ]);

    const bookingIds = [...new Set(raws
      .filter((r) => r.sourceType && BOOKING_SOURCE_TYPES.includes(r.sourceType) && r.sourceId)
      .map((r) => r.sourceId as number))];
    const bookings = new Map<number, BookingInfo>();
    if (bookingIds.length) {
      const found = await prisma.booking.findMany({
        where: { id: { in: bookingIds } },
        select: { id: true, notes: true, formData: true, artist: { select: { name: true } } },
      });
      for (const b of found) {
        bookings.set(b.id, { artistName: b.artist?.name ?? null, notes: b.notes, formData: b.formData });
      }
    }

    const data = withBookingInfo(raws, bookings);
    return paginate(data, total, page, limit);
  }

  async findAllHistory(page: number, limit: number, filters: {
    transactionId?: number;
    changedById?: number;
    startDate?: string;
    endDate?: string;
    action?: string;
  }) {
    const { transactionId, changedById, startDate, endDate, action } = filters;
    const where: Prisma.TransactionHistoryWhereInput = {};

    if (transactionId) where.transactionId = transactionId;
    if (changedById) where.changedById = changedById;
    if (action) where.action = action;
    if (startDate || endDate) {
      where.changedAt = {};
      if (startDate) where.changedAt.gte = new Date(startDate);
      if (endDate) where.changedAt.lte = new Date(endDate + 'T23:59:59.999Z');
    }

    const [raws, total] = await prisma.$transaction([
      prisma.transactionHistory.findMany({
        where,
        ...buildPagination(page, limit),
        orderBy: { changedAt: 'desc' },
        include: {
          changedBy: { select: { id: true, name: true } },
          transaction: { select: { id: true, description: true, type: true } },
        },
      }),
      prisma.transactionHistory.count({ where }),
    ]);

    return paginate(raws, total, page, limit);
  }

  async getSummary(month?: string, startDate?: string, endDate?: string) {
    const cacheKey = `summary_${month || 'all'}_${startDate || ''}_${endDate || ''}`;
    const cached = financeCache.get(cacheKey);
    if (cached) return cached;

    const where: Prisma.TransactionWhereInput = { deletedAt: null };
    const dateFilter = buildDateFilter(month, startDate, endDate);
    if (dateFilter) {
      where.date = dateFilter;
    }

    const rows = await prisma.transaction.groupBy({
      by: ['type'],
      where,
      _sum: { amount: true },
    });

    const result = rows.reduce(
      (acc, row) => {
        const sum = row._sum.amount ? Number(row._sum.amount) : 0;
        if (row.type === 'ENTRATA') acc.totalIncome += sum;
        else acc.totalExpense += sum;
        return acc;
      },
      { totalIncome: 0, totalExpense: 0, balance: 0 }
    );
    result.balance = result.totalIncome - result.totalExpense;

    financeCache.set(cacheKey, result);
    return result;
  }

  async getTrends(months: number = 6) {
    const cacheKey = `trends_${months}`;
    const cached = financeCache.get(cacheKey);
    if (cached) return cached;

    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - months);

    const raw = await prisma.transaction.findMany({
      where: {
        deletedAt: null,
        date: { gte: start, lte: end },
      },
      select: { type: true, amount: true, date: true },
      orderBy: { date: 'asc' },
    });

    const map: Record<string, { income: number; expense: number }> = {};
    raw.forEach((t) => {
      const monthStr = t.date.toISOString().substring(0, 7);
      if (!map[monthStr]) map[monthStr] = { income: 0, expense: 0 };
      const amount = Number(t.amount);
      if (t.type === 'ENTRATA') map[monthStr].income += amount;
      else map[monthStr].expense += amount;
    });

    const result = Object.entries(map)
      .map(([m, data]) => ({ month: m, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    financeCache.set(cacheKey, result);
    return result;
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
      FROM "staff" s
      LEFT JOIN "bookings" b
        ON b."artistId" = s.id
        AND b."deletedAt" IS NULL
        AND b.status = 'COMPLETATO'
        ${month ? Prisma.sql`AND DATE_TRUNC('month', b.date) = DATE_TRUNC('month', ${month + '-01'}::date)` : Prisma.empty}
      WHERE s."deletedAt" IS NULL
      GROUP BY s.id, s.name, s.color
      ORDER BY revenue DESC NULLS LAST
    `;

    return results.map((r) => ({
      artistId: r.artistId,
      artistName: r.artistName ?? 'Sconosciuto',
      artistColor: r.artistColor ?? null,
      bookings: Number(r.bookings),
      revenue: r.revenue ? Number(r.revenue) : 0,
    }));
  }

  async create(data: {
    type: TransactionType;
    category: string;
    description?: string;
    amount: number;
    date?: string;
    sourceId?: number;
    sourceType?: string;
  }, userId?: number) {
    const result = await prisma.$transaction(async (tx) => {
      const created = await tx.transaction.create({
        data: {
          type: data.type,
          category: data.category,
          description: data.description ?? '',
          amount: data.amount,
          date: data.date ? new Date(data.date) : new Date(),
          sourceId: data.sourceId,
          sourceType: data.sourceType,
        },
      });

      if (userId && created.id) {
        await tx.transactionHistory.create({
          data: {
            transactionId: created.id,
            action: 'CREATED',
            newData: toJsonInput(created),
            changedById: userId,
          },
        });
      }

      return { ...created, amount: Number(created.amount) };
    });

    financeCache.clear();
    return result;
  }

  async update(id: number, data: {
    type?: TransactionType;
    category?: string;
    description?: string;
    amount?: number;
    date?: string;
  }, userId?: number) {
    const existing = await prisma.transaction.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new AppError('Transazione non trovata', 404);

    const result = await prisma.$transaction(async (tx) => {
      const updateData: Prisma.TransactionUpdateInput = {};
      if (data.type) updateData.type = data.type;
      if (data.category) updateData.category = data.category;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.amount !== undefined) updateData.amount = data.amount;
      if (data.date) updateData.date = new Date(data.date);

      const updated = await tx.transaction.update({
        where: { id },
        data: updateData,
      });

      if (userId) {
        await tx.transactionHistory.create({
          data: {
            transactionId: id,
            action: 'UPDATED',
            oldData: toJsonInput(existing),
            newData: toJsonInput(updated),
            changedById: userId,
          },
        });
      }

      return { ...updated, amount: Number(updated.amount) };
    });

    financeCache.clear();
    return result;
  }

  async delete(id: number, userId?: number) {
    const existing = await prisma.transaction.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new AppError('Transazione non trovata', 404);

    await prisma.$transaction(async (tx) => {
      await tx.transaction.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      if (userId) {
        await tx.transactionHistory.create({
          data: {
            transactionId: id,
            action: 'DELETED',
            oldData: toJsonInput(existing),
            changedById: userId,
          },
        });
      }
    });

    financeCache.clear();
  }
}
