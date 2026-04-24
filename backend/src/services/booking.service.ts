import { Prisma, Booking } from '@prisma/client';
import prisma from '../utils/prisma';
import { config } from '../config/env';
import { BookingRepository } from '../repositories/booking.repository';
import { validate, createBookingSchema, updateBookingSchema } from '../schemas';
import { AppError } from '../utils/AppError';
import { buildWhereClause, filterByWeekday, type ExportFilters } from '../utils/export-filters';

const repository = new BookingRepository();

type BookingForIncome = Pick<Booking, 'id' | 'price' | 'date' | 'formData'> & { customerId: number };

export class BookingService {
  async getBookings(month?: string, startDate?: string, endDate?: string) {
    return repository.findAll(month, startDate, endDate);
  }

  async getBookingsPaged(month: string | undefined, page: number, limit: number, startDate?: string, endDate?: string) {
    return repository.findAllPaged({ monthStr: month, page, limit, startDate, endDate });
  }

  async getStats(month?: string) {
    return repository.getStats(month);
  }

  async createBooking(body: unknown, changedById?: number) {
    const data = validate(createBookingSchema, body);
    const startDate = new Date(data.date);
    const duration = data.duration ?? 120;

    await this.assertNoConflict(data.artistId, startDate, duration);

    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          customer: { connect: { id: data.customerId } },
          artist: { connect: { id: data.artistId } },
          date: startDate,
          duration,
          price: data.price ?? null,
          deposit: data.deposit ?? null,
          notes: data.notes,
          formData: data.formData ? (data.formData as Prisma.InputJsonValue) : undefined,
        },
      });

      await tx.bookingHistory.create({
        data: {
          bookingId: booking.id,
          action: 'CREATED',
          newDate: booking.date,
          changedById,
        },
      });

      return booking;
    });
  }

  async updateBooking(id: number, body: unknown, changedById?: number) {
    const data = validate(updateBookingSchema, body);

    const oldBooking = await repository.findById(id);
    if (!oldBooking || oldBooking.deletedAt) {
      throw new AppError('Prenotazione non trovata', 404, 'NOT_FOUND');
    }

    // Conflict check se cambia data, artista, o durata
    const newDate = data.date ? new Date(data.date) : oldBooking.date;
    const newDuration = data.duration ?? oldBooking.duration;
    const newStatus = data.status ?? oldBooking.status;

    const newArtistId = data.artistId ?? oldBooking.artistId;
    if (newStatus !== 'CANCELLED' && (data.date || data.duration || data.artistId) && newArtistId) {
      await this.assertNoConflict(newArtistId, newDate, newDuration, id);
    }

    return prisma.$transaction(async (tx) => {
      const { formData: rawFormData, duration, ...rest } = data;
      const booking = await tx.booking.update({
        where: { id },
        data: {
          ...rest,
          ...(duration !== undefined && { duration }),
          ...(rawFormData !== undefined && { formData: rawFormData as Prisma.InputJsonValue }),
        },
      });

      const action =
        data.status === 'CANCELLED' ? 'CANCELLED'
        : data.status === 'COMPLETED' ? 'COMPLETED'
        : data.date ? 'RESCHEDULED'
        : 'UPDATED';

      await tx.bookingHistory.create({
        data: {
          bookingId: id,
          action,
          oldDate: oldBooking.date,
          newDate: data.date ? new Date(data.date) : null,
          changedById,
        },
      });

      // Se la prenotazione è completata e ha un prezzo, genera automaticamente una transazione di incasso
      if (data.status === 'COMPLETED' && oldBooking.status !== 'COMPLETED' && booking.price) {
        const bookingForIncome: BookingForIncome = {
          id: booking.id,
          price: booking.price,
          date: booking.date,
          formData: booking.formData,
          customerId: booking.customerId,
        };
        await this.createIncomeTransactionForBooking(tx, bookingForIncome);
      }

      return booking;
    });
  }

  async getHistory(bookingId: number) {
    return prisma.bookingHistory.findMany({
      where: { bookingId },
      orderBy: { changedAt: 'desc' },
    });
  }

  async deleteBooking(id: number) {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new AppError('Prenotazione non trovata', 404);

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED', price: 0 },
    });

    await prisma.bookingHistory.create({
      data: {
        bookingId: id,
        action: 'CANCELLED',
        oldDate: booking.date,
        changedById: booking.artistId,
      },
    });

    if (booking.price) {
      await prisma.transaction.deleteMany({
        where: { description: { contains: `#${id}` } },
      });
    }

    return updated;
  }

  async getAvailableArtists(dateIso: string) {
    const start = new Date(dateIso);
    const durationMin = config.defaultBookingDurationMinutes;
    const end = new Date(start.getTime() + durationMin * 60_000);

    const busyRows = await prisma.$queryRaw<Array<{ artistId: number }>>(Prisma.sql`
      SELECT DISTINCT "artistId" FROM "Booking"
      WHERE "deletedAt" IS NULL
        AND "status" <> 'CANCELLED'
        AND "artistId" IS NOT NULL
        AND "date" < ${end}
        AND ("date" + ("duration" || ' minutes')::interval) > ${start}
    `);

    const busyIds = new Set(busyRows.map(r => r.artistId));

    const allStaff = await prisma.staff.findMany({
      select: { id: true, name: true, color: true },
      orderBy: { name: 'asc' },
    });

    return allStaff.filter(s => !busyIds.has(s.id));
  }

  private async assertNoConflict(
    artistId: number,
    start: Date,
    duration: number,
    excludeId?: number
  ) {
    const conflict = await repository.findOverlapping(artistId, start, duration, excludeId);
    if (conflict) {
      throw new AppError(
        'Esiste già una prenotazione per questo artista nella fascia oraria selezionata',
        409,
        'BOOKING_CONFLICT',
        { conflictingBookingId: conflict.id }
      );
    }
  }

  async verifyPassword(password: string): Promise<void> {
    const expectedPassword = config.bookingUpdatePassword;
    if (password !== expectedPassword) {
      throw new AppError('Password non corretta', 403, 'INVALID_PASSWORD');
    }
  }

  private async createIncomeTransactionForBooking(tx: Prisma.TransactionClient, booking: BookingForIncome): Promise<void> {
    const fd = booking.formData as Record<string, unknown> | null;
    const artistPrice = fd && typeof fd.artistPrice === 'number' ? fd.artistPrice : 0;
    const fullPrice = booking.price ?? 0;
    const bookingDate = booking.date ?? new Date();

    // Entrata: prezzo pieno incassato dal cliente
    await tx.transaction.create({
      data: {
        type: 'INCOME',
        category: 'Tatuaggio',
        description: `Incasso prenotazione #${booking.id}`,
        amount: fullPrice,
        date: bookingDate,
      },
    });

    // Uscita: compenso artista (se presente)
    if (artistPrice > 0) {
      await tx.transaction.create({
        data: {
          type: 'EXPENSE',
          category: 'Compenso Artista',
          description: `Compenso artista — prenotazione #${booking.id}`,
          amount: artistPrice,
          date: bookingDate,
        },
      });
    }
  }

  async getBookingsForExport(filters: ExportFilters) {
    const where = buildWhereClause(filters);
    let bookings = await repository.findWithFilters(where);

    // Applica il filtro per weekday in memoria (se necessario)
    if (filters.weekday) {
      bookings = filterByWeekday(bookings, filters.weekday);
    }

    return bookings;
  }
}
