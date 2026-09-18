import { BookingStatus, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { config } from '../../../core/config/env';
import { AppError } from '../../../core/shared/errors/AppError';
import { buildPagination, paginate } from '../../../core/shared/kernel/pagination';
import { getMonthRange } from '../../../core/shared/utils/date-utils';
import prisma from '../../../core/shared/utils/prisma';
import { financeCache } from '../../finance/services/finance.cache';
import { softDeleteMirrorTransactions } from '../../finance/services/financeMirror';

export interface BookingFilters {
  month?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  offset?: number;
  status?: BookingStatus | 'ALL';
  search?: string;
  sortOrder?: Prisma.SortOrder;
  isRentPayee?: boolean | string;
}

export interface BookingHistoryFilters {
  startDate?: string;
  endDate?: string;
  action?: BookingStatus;
  userId?: number;
  artistId?: number;
  search?: string;
}

export class BookingService {
  async findAll(filters: BookingFilters) {
    const { month, startDate, endDate, page, limit, offset, status, search, sortOrder } = filters;
    const where: Prisma.BookingWhereInput = {
      deletedAt: null,
      customer: { is: { deletedAt: null } },
    };

    const dateBounds: { gte?: Date; lt?: Date; lte?: Date } = {};
    if (month) {
      const range = getMonthRange(month);
      dateBounds.gte = range.gte;
      dateBounds.lt = range.lt;
    }
    if (startDate) {
      const from = new Date(startDate);
      if (!dateBounds.gte || from > dateBounds.gte) dateBounds.gte = from;
    }
    if (endDate) {
      dateBounds.lte = new Date(endDate + 'T23:59:59.999');
    }
    if (Object.keys(dateBounds).length > 0) {
      where.date = dateBounds;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }
    // status === 'ALL' → nessun filtro, mostra tutti gli stati

    if (filters.isRentPayee !== undefined) {
      const isRentBool = filters.isRentPayee === true || filters.isRentPayee === 'true';
      where.artist = { is: { isRentPayee: isRentBool } };
    }

    if (search) {
      where.OR = [
        { customer: { is: { firstName: { contains: search, mode: 'insensitive' } } } },
        { customer: { is: { lastName: { contains: search, mode: 'insensitive' } } } },
        { customer: { is: { phone: { contains: search } } } },
        { artist: { is: { name: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    if (page) {
      const [raws, total] = await prisma.$transaction([
        prisma.booking.findMany({
          where,
          ...buildPagination(page, limit ?? 25),
          orderBy: { date: sortOrder ?? 'desc' },
          include: { customer: true, artist: true },
        }),
        prisma.booking.count({ where }),
      ]);

      return paginate(
        raws.map(r => ({ ...r, price: r.price ? Number(r.price) : null, deposit: r.deposit ? Number(r.deposit) : null })),
        total,
        page,
        limit ?? 25
      );
    }

    const [raws, total] = await prisma.$transaction([
      prisma.booking.findMany({
        where,
        orderBy: { date: sortOrder ?? 'asc' },
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
      created: counts.CREATO ?? 0,
      confirmed: counts.CONFERMATO ?? 0,
      modified: counts.MODIFICATO ?? 0,
      rescheduled: counts.SPOSTATO ?? 0,
      cancelled: counts.CANCELLATO ?? 0,
      annullated: counts.ANNULLATO ?? 0,
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

  async findAllHistory(page: number, limit: number, filters: BookingHistoryFilters) {
    const { startDate, endDate, action, userId, artistId, search } = filters;
    const where: Prisma.BookingHistoryWhereInput = {};

    if (startDate || endDate) {
      where.changedAt = {};
      if (startDate) where.changedAt.gte = new Date(startDate);
      if (endDate) where.changedAt.lte = new Date(endDate + 'T23:59:59');
    }

    if (action) where.action = action as BookingStatus;
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
        AND "status" NOT IN ('ANNULLATO', 'CANCELLATO')
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

  async create(data: Record<string, unknown>, changedById?: number) {
    const startDate = new Date(data.date as string | number | Date);
    const duration = (data.duration as number) ?? 120;
    const endDate = new Date(startDate.getTime() + duration * 60_000);
    const artistId = data.artistId as number;

    const result = await prisma.$transaction(async (tx) => {
      // Lock esclusivo per artista: serializza le richieste concorrenti sullo stesso artista
      // ed elimina la race condition tra il check conflitti e l'INSERT.
      await tx.$executeRaw(Prisma.sql`SELECT pg_advisory_xact_lock(${artistId}::bigint)`);

      const conflictRows = await tx.$queryRaw<Array<{ id: number }>>(Prisma.sql`
        SELECT id FROM "bookings"
        WHERE "artistId" = ${artistId}
          AND "deletedAt" IS NULL
          AND "status" NOT IN ('ANNULLATO', 'CANCELLATO')
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
      const booking = await tx.booking.create({
        data: {
          customerId: data.customerId as number,
          artistId: data.artistId as number,
          date: startDate,
          duration,
          status: 'CREATO',
          price: data.price as number | Prisma.Decimal | null,
          deposit: data.deposit as number | Prisma.Decimal | null,
          notes: data.notes as string | null,
          formData: (data.formData as Prisma.InputJsonValue) ?? Prisma.JsonNull,
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
        let isRentPayee = false;
        if (booking.artistId && tx.staff) {
          const artist = await tx.staff.findUnique({
            where: { id: booking.artistId },
            select: { isRentPayee: true },
          });
          if (artist?.isRentPayee) isRentPayee = true;
        }

        if (!isRentPayee) {
          const customerName = booking.customer
            ? `${booking.customer.firstName} ${booking.customer.lastName || ''}`.trim()
            : 'Cliente';

          await tx.transaction.create({
            data: {
              type: 'ENTRATA',
              category: 'Acconto',
              description: `Acconto prenotazione #${booking.id} - ${customerName}`,
              amount: booking.deposit,
              date: new Date(),
              sourceId: booking.id,
              sourceType: 'BOOKING_DEPOSIT',
            },
          });
        }
      }

      return { ...booking, price: booking.price ? Number(booking.price) : null, deposit: booking.deposit ? Number(booking.deposit) : null };
    });
    financeCache.clear();
    return result;
  }

  async update(id: number, data: Record<string, unknown>, changedById?: number) {
    const oldBooking = await prisma.booking.findUnique({
      where: { id },
      include: { customer: true, artist: true },
    });

    if (!oldBooking || oldBooking.deletedAt) {
      throw new AppError('Prenotazione non trovata', 404, 'NOT_FOUND');
    }

    const newDate = data.date ? new Date(data.date as string | number | Date) : oldBooking.date;
    const newDuration = (data.duration as number) ?? oldBooking.duration;
    const newStatus = (data.status as BookingStatus) ?? oldBooking.status;
    const newArtistId = (data.artistId as number) ?? oldBooking.artistId;
    const endDate = new Date(newDate.getTime() + newDuration * 60_000);

    const needsConflictCheck =
      newStatus !== 'ANNULLATO' && newStatus !== 'CANCELLATO' && (data.date || data.duration || data.artistId);

    const result = await prisma.$transaction(async (tx) => {
      if (needsConflictCheck) {
        // Lock esclusivo per artista: serializza le richieste concorrenti sullo stesso artista.
        await tx.$executeRaw(Prisma.sql`SELECT pg_advisory_xact_lock(${newArtistId}::bigint)`);

        const conflictRows = await tx.$queryRaw<Array<{ id: number }>>(Prisma.sql`
          SELECT id FROM "bookings"
          WHERE "artistId" = ${newArtistId}
            AND "deletedAt" IS NULL
            AND "status" NOT IN ('ANNULLATO', 'CANCELLATO')
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
      const updated = await tx.booking.update({
        where: { id },
        data: {
          ...(data.date !== undefined ? { date: new Date(data.date as string | number | Date) } : {}),
          ...(data.artistId !== undefined ? { artistId: data.artistId as number } : {}),
          ...(data.duration !== undefined ? { duration: data.duration as number } : {}),
          ...(data.status !== undefined ? { status: data.status as BookingStatus } : {}),
          ...(data.price !== undefined ? { price: data.price as number | Prisma.Decimal } : {}),
          ...(data.deposit !== undefined ? { deposit: data.deposit as number | Prisma.Decimal } : {}),
          ...(data.notes !== undefined ? { notes: data.notes as string | null } : {}),
          ...(data.formData !== undefined ? { formData: data.formData as Prisma.InputJsonValue } : {}),
          ...(data.customerId !== undefined ? { customerId: data.customerId as number } : {}),
        },
        include: { customer: true, artist: true },
      });

      const action: BookingStatus =
        data.status === 'CANCELLATO' ? 'CANCELLATO'
        : data.status === 'ANNULLATO' ? 'ANNULLATO'
        : data.status === 'COMPLETATO' ? 'COMPLETATO'
        : data.date || data.duration || data.artistId ? 'SPOSTATO'
        : 'MODIFICATO';

      await tx.bookingHistory.create({
        data: {
          bookingId: id,
          action,
          oldDate: oldBooking.date,
          newDate: data.date ? new Date(data.date as string | number | Date) : null,
          changedById: changedById ?? null,
        },
      });

      let isRentPayeeDeposit = false;
      if (updated.artistId && tx.staff) {
        const artist = await tx.staff.findUnique({
          where: { id: updated.artistId },
          select: { isRentPayee: true },
        });
        if (artist?.isRentPayee) isRentPayeeDeposit = true;
      }

      if (!isRentPayeeDeposit) {
        const previousDeposit = Number(oldBooking.deposit ?? 0);
        const currentDeposit = Number(updated.deposit ?? 0);
        const depositDifference = currentDeposit - previousDeposit;
        const customerName = updated.customer
          ? `${updated.customer.firstName} ${updated.customer.lastName || ''}`.trim()
          : 'Cliente';

        if (depositDifference > 0) {
          await tx.transaction.create({
            data: {
              type: 'ENTRATA',
              category: 'Acconto',
              description: `Acconto aggiuntivo prenotazione #${updated.id} - ${customerName}`,
              amount: depositDifference,
              date: new Date(),
              sourceId: updated.id,
              sourceType: 'BOOKING_DEPOSIT',
            },
          });
        } else if (depositDifference < 0) {
          await tx.transaction.create({
            data: {
              type: 'USCITA',
              category: 'Acconto',
              description: `Rimborso parziale acconto prenotazione #${updated.id} - ${customerName}`,
              amount: Math.abs(depositDifference),
              date: new Date(),
              sourceId: updated.id,
              sourceType: 'BOOKING_DEPOSIT_REFUND',
            },
          });
        }
      }

      const isNewCancellation =
        (data.status === 'ANNULLATO' || data.status === 'CANCELLATO') &&
        oldBooking.status !== data.status;
      if (isNewCancellation) {
        await this.refundOutstandingDeposit(tx, updated);
      }

      // (Audit H2) Logica finanziaria di completamento unificata e transazionale:
      // booking COMPLETATO, saldo e compenso artista sono atomici.
      if (data.status === 'COMPLETATO' && oldBooking.status !== 'COMPLETATO') {
        await this.handleCompletionTransactions(tx, updated);
      }

      return { ...updated, price: updated.price ? Number(updated.price) : null, deposit: updated.deposit ? Number(updated.deposit) : null };
    });
    financeCache.clear();
    return result;
  }

  async delete(id: number, changedById?: number, refund: boolean = true) {
    await prisma.$transaction(async (tx) => {
      const oldBooking = await tx.booking.findUnique({
        where: { id },
        include: { customer: true },
      });
      if (!oldBooking || oldBooking.deletedAt) {
        throw new AppError('Prenotazione non trovata', 404, 'NOT_FOUND');
      }

      await tx.booking.update({
        where: { id },
        data: { status: 'CANCELLATO', price: 0, deletedAt: new Date() },
      });

      await tx.bookingHistory.create({
        data: {
          bookingId: id,
          action: 'CANCELLATO',
          oldDate: oldBooking.date,
          changedById: changedById ?? null,
        },
      });

      await softDeleteMirrorTransactions(tx, id, ['BOOKING', 'BOOKING_COMMISSION']);

      if (refund) {
        await this.refundOutstandingDeposit(tx, oldBooking);
      }
    });
    financeCache.clear();
  }

  async annul(id: number, changedById?: number) {
    await prisma.$transaction(async (tx) => {
      const oldBooking = await tx.booking.findUnique({
        where: { id },
        include: { customer: true },
      });
      if (!oldBooking || oldBooking.deletedAt) {
        throw new AppError('Prenotazione non trovata', 404, 'NOT_FOUND');
      }

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

      await softDeleteMirrorTransactions(tx, id, ['BOOKING', 'BOOKING_COMMISSION']);

      await this.refundOutstandingDeposit(tx, oldBooking);
    });
    financeCache.clear();
  }

  /**
   * (Audit H2) Logica finanziaria di completamento condivisa e transazionale.
   * Chiamata DENTRO prisma.$transaction da update() e updateKanbanStatus():
   * garantisce atomicità tra booking COMPLETATO, saldo/incasso e compenso artista.
   * Include dedup della transazione "Saldo" (idempotenza su retry/concorrenza).
   */
  private async handleCompletionTransactions(
    tx: Prisma.TransactionClient,
    booking: {
      id: number;
      artistId?: number | null;
      price: Prisma.Decimal | number | null;
      deposit: Prisma.Decimal | number | null;
      formData?: unknown;
      customer?: { firstName: string; lastName: string | null } | null;
    },
  ): Promise<void> {
    if (!booking.price) return;

    let isRentPayee = false;
    if (booking.artistId && tx.staff) {
      const artist = await tx.staff.findUnique({
        where: { id: booking.artistId },
        select: { isRentPayee: true },
      });
      if (artist?.isRentPayee) isRentPayee = true;
    }
    if (isRentPayee) return;

    const customerName = booking.customer
      ? `${booking.customer.firstName} ${booking.customer.lastName || ''}`.trim()
      : 'Cliente';

    const fd = (booking.formData || {}) as Record<string, unknown>;
    const artistPrice = typeof fd.artistPrice === 'number' ? fd.artistPrice : 0;
    const fullPrice = Number(booking.price) || 0;
    const completionDate = new Date();
    const depositAmount = Number(booking.deposit) || 0;
    const finalIncomeAmount = fullPrice - depositAmount;

    if (finalIncomeAmount > 0) {
      const description = depositAmount > 0
        ? `Saldo prenotazione #${booking.id} - ${customerName}`
        : `Incasso prenotazione #${booking.id} - ${customerName}`;

      // Dedup: evita doppio incasso se il completamento viene ripetuto
      const existingTx = await tx.transaction.findFirst({
        where: { sourceId: booking.id, sourceType: 'BOOKING', deletedAt: null },
      });

      if (!existingTx) {
        await tx.transaction.create({
          data: {
            type: 'ENTRATA',
            category: 'Tatuaggio',
            description,
            amount: finalIncomeAmount,
            date: completionDate,
            sourceId: booking.id,
            sourceType: 'BOOKING',
          },
        });
      }
    }

    if (artistPrice > 0) {
      // Dedup: evita doppio compenso se il completamento viene ripetuto
      const existingCommission = await tx.transaction.findFirst({
        where: { sourceId: booking.id, sourceType: 'BOOKING_COMMISSION', deletedAt: null },
      });

      if (!existingCommission) {
        await tx.transaction.create({
          data: {
            type: 'USCITA',
            category: 'Compenso Artista',
            description: `Compenso artista — prenotazione #${booking.id}`,
            amount: artistPrice,
            date: completionDate,
            sourceId: booking.id,
            sourceType: 'BOOKING_COMMISSION',
          },
        });
      }
    }
  }

  private async refundOutstandingDeposit(
    tx: Prisma.TransactionClient,
    booking: {
      id: number;
      artistId?: number | null;
      deposit: Prisma.Decimal | number | null;
      customer?: { firstName: string; lastName: string | null } | null;
    },
  ): Promise<void> {
    const depositAmount = Number(booking.deposit ?? 0);
    if (depositAmount <= 0) return;

    if (booking.artistId && tx.staff) {
      const artist = await tx.staff.findUnique({
        where: { id: booking.artistId },
        select: { isRentPayee: true },
      });
      if (artist?.isRentPayee) return;
    }

    const previousRefunds = await tx.transaction.findMany({
      where: {
        sourceId: booking.id,
        sourceType: 'BOOKING_REFUND',
        deletedAt: null,
      },
      select: { amount: true },
    });
    const refundedAmount = previousRefunds.reduce(
      (total, transaction) => total + Number(transaction.amount),
      0,
    );
    const outstandingAmount = depositAmount - refundedAmount;
    if (outstandingAmount <= 0) return;

    const customerName = booking.customer
      ? `${booking.customer.firstName} ${booking.customer.lastName || ''}`.trim()
      : 'Cliente';

    await tx.transaction.create({
      data: {
        type: 'USCITA',
        category: 'Acconto',
        description: `Rimborso acconto prenotazione #${booking.id} - ${customerName}`,
        amount: outstandingAmount,
        date: new Date(),
        sourceId: booking.id,
        sourceType: 'BOOKING_REFUND',
      },
    });
  }

  async getTodayKanbanBookings(dateStr?: string) {
    const targetDate = dateStr ? new Date(dateStr) : new Date();
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

    const bookings = await prisma.booking.findMany({
      where: {
        deletedAt: null,
        status: { notIn: ['ANNULLATO', 'CANCELLATO'] },
        date: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        customer: true,
        artist: true,
        attachments: true,
      },
      orderBy: { date: 'asc' },
    });

    return bookings.map((b) => {
      const price = b.price ? Number(b.price) : 0;
      const deposit = b.deposit ? Number(b.deposit) : 0;
      const outstandingBalance = Math.max(0, price - deposit);
      const formData = (b.formData as Record<string, unknown>) || {};

      let kanbanStage = formData.kanbanStage;
      if (!kanbanStage) {
        if (b.status === 'COMPLETATO') {
          kanbanStage = 'SALDATO';
        } else if (b.status === 'CONFERMATO') {
          kanbanStage = 'IN_SEDUTA';
        } else {
          kanbanStage = 'IN_ARRIVO';
        }
      }

      return {
        ...b,
        price,
        deposit,
        outstandingBalance,
        kanbanStage,
        sessionStartedAt: (formData.sessionStartedAt as string | null) || null,
      };
    });
  }

  async updateKanbanStatus(id: number, stage: string, userId?: number) {
    const existing = await prisma.booking.findUnique({
      where: { id },
      include: { customer: true, artist: true },
    });

    if (!existing || existing.deletedAt) {
      throw new AppError('Prenotazione non trovata', 404);
    }

    const existingFormData = (existing.formData as Record<string, unknown>) || {};
    const updatedFormData = {
      ...existingFormData,
      kanbanStage: stage,
      ...(stage === 'IN_SEDUTA' && !existingFormData.sessionStartedAt
        ? { sessionStartedAt: new Date().toISOString() }
        : {}),
    };

    let newStatus = existing.status;
    if (stage === 'SALDATO' && existing.status !== 'COMPLETATO') {
      newStatus = 'COMPLETATO';
    } else if (stage === 'IN_SEDUTA' && existing.status === 'CREATO') {
      newStatus = 'CONFERMATO';
    }

    // (Audit H2) Tutto transazionale: update booking + history + transazioni
    // finanziarie di completamento sono atomiche. Un crash a metà non può più
    // lasciare un booking COMPLETATO senza incasso registrato.
    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.booking.update({
        where: { id },
        data: {
          status: newStatus,
          formData: updatedFormData,
        },
        include: {
          customer: true,
          artist: true,
          attachments: true,
        },
      });

      if (userId) {
        await tx.bookingHistory.create({
          data: {
            bookingId: id,
            action: newStatus,
            changedById: userId,
          },
        });
      }

      if (newStatus === 'COMPLETATO' && existing.status !== 'COMPLETATO') {
        await this.handleCompletionTransactions(tx, result);
      }

      return result;
    });
    financeCache.clear();

    const price = updated.price ? Number(updated.price) : 0;
    const deposit = updated.deposit ? Number(updated.deposit) : 0;
    return {
      ...updated,
      price,
      deposit,
      outstandingBalance: Math.max(0, price - deposit),
      kanbanStage: stage,
      sessionStartedAt: updatedFormData.sessionStartedAt || null,
    };
  }
}
