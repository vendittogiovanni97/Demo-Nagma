import { Prisma } from '@prisma/client';
import prisma from '../../../core/shared/utils/prisma';
import { AppError } from '../../../core/shared/errors/AppError';
import { paginate, buildPagination } from '../../../core/shared/kernel/pagination';
import { getMonthRange } from '../../../core/shared/utils/date-utils';
import { config } from '../../../core/config/env';
import bcrypt from 'bcryptjs';

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

export class BookingService {
  async findAll(filters: any) {
    const { month, startDate, endDate, page, limit = 20, offset } = filters;
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

    if (page) {
      const [raws, total] = await prisma.$transaction([
        prisma.booking.findMany({
          where,
          ...buildPagination(page, limit),
          orderBy: { date: 'desc' },
          include: { customer: true, artist: true },
        }),
        prisma.booking.count({ where }),
      ]);

      return paginate(
        raws.map(r => ({ ...r, price: r.price ? Number(r.price) : null, deposit: r.deposit ? Number(r.deposit) : null })),
        total,
        page,
        limit
      );
    }

    const [raws, total] = await prisma.$transaction([
      prisma.booking.findMany({
        where,
        orderBy: { date: 'asc' },
        include: { customer: true, artist: true },
        ...(limit && { take: limit }),
        ...(offset && { skip: offset }),
      }),
      prisma.booking.count({ where }),
    ]);

    const data = raws.map(r => ({ ...r, price: r.price ? Number(r.price) : null, deposit: r.deposit ? Number(r.deposit) : null }));
    const hasMore = limit ? (offset ?? 0) + raws.length < total : false;
    return { data, total, hasMore };
  }

  async findStats(month?: string) {
    const where: Prisma.BookingWhereInput = { deletedAt: null };
    if (month) {
      where.date = getMonthRange(month);
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

    return {
      total: Object.values(counts).reduce((sum, v) => sum + v, 0),
      confirmed: counts.CONFERMATO ?? 0,
      cancelled: counts.CANCELLATO ?? counts.ANNULLATO ?? 0,
      rescheduled: counts.SPOSTATO ?? 0,
      completed: counts.COMPLETATO ?? 0,
      month: month ?? null,
    };
  }

  async findHistory(bookingId: number) {
    return prisma.bookingHistory.findMany({
      where: { bookingId },
      orderBy: { changedAt: 'desc' },
      include: {
        booking: { include: { customer: true, artist: true } },
        changedBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findAllHistory(page: number, limit: number, filters: any) {
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
        ...(search
          ? {
              customer: {
                OR: [
                  { firstName: { contains: search, mode: 'insensitive' } },
                  { lastName: { contains: search, mode: 'insensitive' } },
                  { phone: { contains: search } },
                ],
              },
            }
          : {}),
      };
    }

    const [raws, total] = await prisma.$transaction([
      prisma.bookingHistory.findMany({
        where,
        ...buildPagination(page, limit),
        orderBy: { changedAt: 'desc' },
        include: {
          booking: { include: { customer: true, artist: true } },
          changedBy: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.bookingHistory.count({ where }),
    ]);

    return paginate(raws, total, page, limit);
  }

  async findAvailableArtists(dateIso: string) {
    const start = new Date(dateIso);
    const durationMin = config.defaultBookingDurationMinutes;
    const end = new Date(start.getTime() + durationMin * 60_000);

    const busyRows = await prisma.$queryRaw<Array<{ artistId: number }>>(Prisma.sql`
      SELECT DISTINCT "artistId" FROM "bookings"
      WHERE "deletedAt" IS NULL
        AND "status" <> 'CANCELLATO'
        AND "artistId" IS NOT NULL
        AND "date" < ${end}
        AND ("date" + ("duration" || ' minutes')::interval) > ${start}
    `);

    const busyIds = new Set(busyRows.map(r => r.artistId));

    const allStaff = await prisma.staff.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, color: true },
      orderBy: { name: 'asc' },
    });

    return allStaff.filter(s => !busyIds.has(s.id));
  }

  async verifyPassword(password: string) {
    const clientConfig = await prisma.clientConfig.findFirst();

    const storedPassword = clientConfig?.bookingUpdatePassword;
    if (!storedPassword) {
      throw new AppError("Password non configurata. Contattare l'amministratore.", 503, 'PASSWORD_NOT_CONFIGURED');
    }

    let isValid: boolean;
    if (!storedPassword.startsWith('$2b$')) {
      const salt = config.bcryptSaltRounds;
      const hashed = await bcrypt.hash(storedPassword, salt);
      await prisma.clientConfig.update({
        where: { id: clientConfig!.id },
        data: { bookingUpdatePassword: hashed },
      });
      isValid = await bcrypt.compare(password, hashed);
    } else {
      isValid = await bcrypt.compare(password, storedPassword);
    }

    if (!isValid) {
      throw new AppError('Password non corretta', 403, 'INVALID_PASSWORD');
    }
  }

  async create(data: any, changedById?: number) {
    const startDate = new Date(data.date);
    const duration = data.duration ?? 120;
    const endDate = new Date(startDate.getTime() + duration * 60_000);

    const conflictRows = await prisma.$queryRaw<Array<{ id: number }>>(Prisma.sql`
      SELECT id FROM "bookings"
      WHERE "artistId" = ${data.artistId}
        AND "deletedAt" IS NULL
        AND "status" <> 'CANCELLATO'
        AND "date" < ${endDate}
        AND ("date" + ("duration" || ' minutes')::interval) > ${startDate}
      LIMIT 1
    `);

    if (conflictRows[0]) {
      throw new AppError(
        'Esiste già una prenotazione per questo artista nella fascia oraria selezionata',
        409,
        'BOOKING_CONFLICT',
        { conflictingBookingId: conflictRows[0].id }
      );
    }

    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          customerId: data.customerId,
          artistId: data.artistId,
          date: startDate,
          duration,
          status: 'CREATO',
          price: data.price,
          deposit: data.deposit,
          notes: data.notes,
          formData: data.formData as any,
        },
        include: { customer: true, artist: true },
      });

      await tx.bookingHistory.create({
        data: {
          bookingId: booking.id,
          action: 'CREATO',
          newDate: booking.date,
          changedById: changedById ?? null,
        },
      });

      if (booking.deposit && Number(booking.deposit) > 0) {
        const customerName = booking.customer
          ? `${booking.customer.firstName} ${booking.customer.lastName || ''}`.trim()
          : 'Cliente';

        await tx.transaction.create({
          data: {
            type: 'INCOME',
            category: 'Acconto',
            description: `Acconto prenotazione #${booking.id} - ${customerName}`,
            amount: booking.deposit,
            date: new Date(),
            sourceId: booking.id,
            sourceType: 'BOOKING_DEPOSIT',
          },
        });
      }

      return { ...booking, price: booking.price ? Number(booking.price) : null, deposit: booking.deposit ? Number(booking.deposit) : null };
    });
  }

  async update(id: number, data: any, changedById?: number) {
    const oldBooking = await prisma.booking.findUnique({
      where: { id },
      include: { customer: true, artist: true },
    });

    if (!oldBooking || oldBooking.deletedAt) {
      throw new AppError('Prenotazione non trovata', 404, 'NOT_FOUND');
    }

    const newDate = data.date ? new Date(data.date) : oldBooking.date;
    const newDuration = data.duration ?? oldBooking.duration;
    const newStatus = data.status ?? oldBooking.status;
    const newArtistId = data.artistId ?? oldBooking.artistId;
    const endDate = new Date(newDate.getTime() + newDuration * 60_000);

    if (newStatus !== 'ANNULLATO' && newStatus !== 'CANCELLATO' && (data.date || data.duration || data.artistId)) {
      const conflictRows = await prisma.$queryRaw<Array<{ id: number }>>(Prisma.sql`
      SELECT id FROM "bookings"
      WHERE "artistId" = ${newArtistId}
        AND "deletedAt" IS NULL
        AND "status" <> 'CANCELLATO'
        AND "date" < ${endDate}
        AND ("date" + ("duration" || ' minutes')::interval) > ${newDate}
        AND id <> ${id}
      LIMIT 1
      `);

      if (conflictRows[0]) {
        throw new AppError(
          'Esiste già una prenotazione per questo artista nella fascia oraria selezionata',
          409,
          'BOOKING_CONFLICT',
          { conflictingBookingId: conflictRows[0].id }
        );
      }
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id },
        data: {
          ...(data.date !== undefined ? { date: new Date(data.date) } : {}),
          ...(data.artistId !== undefined ? { artistId: data.artistId } : {}),
          ...(data.duration !== undefined ? { duration: data.duration } : {}),
          ...(data.status !== undefined ? { status: data.status } : {}),
          ...(data.price !== undefined ? { price: data.price } : {}),
          ...(data.deposit !== undefined ? { deposit: data.deposit } : {}),
          ...(data.notes !== undefined ? { notes: data.notes } : {}),
          ...(data.formData !== undefined ? { formData: data.formData } : {}),
          ...(data.customerId !== undefined ? { customerId: data.customerId } : {}),
        },
        include: { customer: true, artist: true },
      });

      const action =
        data.status === 'ANNULLATO' || data.status === 'CANCELLATO' ? 'ANNULLATO'
        : data.status === 'COMPLETATO' ? 'COMPLETATO'
        : data.date || data.duration || data.artistId ? 'SPOSTATO'
        : 'MODIFICATO';

      await tx.bookingHistory.create({
        data: {
          bookingId: id,
          action,
          oldDate: oldBooking.date,
          newDate: data.date ? new Date(data.date) : null,
          changedById: changedById ?? null,
        },
      });

      if (data.status === 'COMPLETATO' && oldBooking.status !== 'COMPLETATO' && updated.price) {
        const fd = (updated.formData || {}) as Record<string, unknown>;
        const artistPrice = typeof fd.artistPrice === 'number' ? fd.artistPrice : 0;
        const fullPrice = Number(updated.price) || 0;
        const bookingDate = updated.date ?? new Date();
        const customerName = updated.customer
          ? `${updated.customer.firstName} ${updated.customer.lastName || ''}`.trim()
          : 'Cliente';
        const depositAmount = Number(updated.deposit) ?? 0;
        const finalIncomeAmount = fullPrice - depositAmount;

        if (finalIncomeAmount > 0) {
          const description = depositAmount > 0
            ? `Saldo prenotazione #${updated.id} - ${customerName}`
            : `Incasso prenotazione #${updated.id} - ${customerName}`;

          await tx.transaction.create({
            data: {
              type: 'INCOME',
              category: 'Tatuaggio',
              description,
              amount: finalIncomeAmount,
              date: bookingDate,
              sourceId: updated.id,
              sourceType: 'BOOKING',
            },
          });
        }

        if (artistPrice > 0) {
          await tx.transaction.create({
            data: {
              type: 'EXPENSE',
              category: 'Compenso Artista',
              description: `Compenso artista — prenotazione #${updated.id}`,
              amount: artistPrice,
              date: bookingDate,
              sourceId: updated.id,
              sourceType: 'BOOKING_COMMISSION',
            },
          });
        }
      }

      return { ...updated, price: updated.price ? Number(updated.price) : null, deposit: updated.deposit ? Number(updated.deposit) : null };
    });
  }

  async delete(id: number, changedById?: number) {
    return prisma.$transaction(async (tx) => {
      const oldBooking = await tx.booking.findUnique({
        where: { id },
        include: { customer: true },
      });
      if (!oldBooking) return;

      await tx.booking.update({
        where: { id },
        data: { status: 'CANCELLATO', price: 0 },
      });

      await tx.bookingHistory.create({
        data: {
          bookingId: id,
          action: 'CANCELLATO',
          oldDate: oldBooking.date,
          changedById: changedById ?? null,
        },
      });

      await tx.transaction.deleteMany({
        where: {
          sourceId: id,
          sourceType: { in: ['BOOKING', 'BOOKING_COMMISSION'] },
        },
      });

      if (oldBooking.deposit && Number(oldBooking.deposit) > 0) {
        const existingRefund = await tx.transaction.findFirst({
          where: {
            sourceId: id,
            sourceType: 'BOOKING_REFUND',
          },
        });

        if (!existingRefund) {
          const customerName = oldBooking.customer
            ? `${oldBooking.customer.firstName} ${oldBooking.customer.lastName || ''}`.trim()
            : 'Cliente';

          await tx.transaction.create({
            data: {
              type: 'EXPENSE',
              category: 'Acconto',
              description: `Rimborso acconto prenotazione #${oldBooking.id} - ${customerName}`,
              amount: oldBooking.deposit,
              date: new Date(),
              sourceId: oldBooking.id,
              sourceType: 'BOOKING_REFUND',
            },
          });
        }
      }
    });
  }

  async annul(id: number, changedById?: number) {
    return prisma.$transaction(async (tx) => {
      const oldBooking = await tx.booking.findUnique({ where: { id } });
      if (!oldBooking) return;

      await tx.booking.update({
        where: { id },
        data: { status: 'ANNULLATO', price: 0 },
      });

      await tx.bookingHistory.create({
        data: {
          bookingId: id,
          action: 'ANNULLATO',
          oldDate: oldBooking.date,
          changedById: changedById ?? null,
        },
      });

      await tx.transaction.deleteMany({
        where: {
          sourceId: id,
          sourceType: { in: ['BOOKING', 'BOOKING_COMMISSION'] },
        },
      });
    });
  }
}
