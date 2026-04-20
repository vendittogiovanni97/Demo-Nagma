import { Prisma, Booking } from '@prisma/client';
import prisma from '../utils/prisma';
import { config } from '../config/env';
import { BookingRepository } from '../repositories/booking.repository';
import { validate, createBookingSchema, updateBookingSchema } from '../schemas';
import { AppError } from '../utils/AppError';

const repository = new BookingRepository();

export class BookingService {
  async getBookings(month?: string) {
    return repository.findAll(month);
  }

  async getBookingsPaged(month: string | undefined, page: number, limit: number) {
    return repository.findAllPaged({ monthStr: month, page, limit });
  }

  async getStats(month?: string) {
    return repository.getStats(month);
  }

  async createBooking(body: unknown, changedBy: string = 'system') {
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
          changedBy,
        },
      });

      return booking;
    });
  }

  async updateBooking(id: number, body: unknown, changedBy: string = 'system') {
    const data = validate(updateBookingSchema, body);

    const oldBooking = await repository.findById(id);
    if (!oldBooking || oldBooking.deletedAt) {
      throw new AppError('Prenotazione non trovata', 404, 'NOT_FOUND');
    }

    // Conflict check se cambia data, artista, o durata
    const newDate = data.date ? new Date(data.date) : oldBooking.date;
    const newDuration = data.duration ?? (oldBooking as any).duration ?? 120;
    const newStatus = data.status ?? oldBooking.status;

    if (newStatus !== 'CANCELLED' && (data.date || data.duration) && oldBooking.artistId) {
      await this.assertNoConflict(oldBooking.artistId, newDate, newDuration, id);
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
          changedBy,
        },
      });

      // Se la prenotazione è completata e ha un prezzo, genera automaticamente una transazione di incasso
      if (data.status === 'COMPLETED' && oldBooking.status !== 'COMPLETED' && booking.price) {
        await this.createIncomeTransactionForBooking(tx, (booking as any));
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
    return repository.delete(id);
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

  private async createIncomeTransactionForBooking(tx: Prisma.TransactionClient, booking: Booking & { customerId: number }): Promise<void> {
    const fd = booking.formData as Record<string, unknown> | null;
    const studioProfit = fd && typeof fd.studioProfit === 'number'
      ? fd.studioProfit
      : booking.price;

    await tx.transaction.create({
      data: {
        type: 'INCOME',
        category: 'Tatuaggio',
        description: `Incasso prenotazione — Cliente ID: ${booking.customerId}`,
        amount: studioProfit ?? 0,
        date: new Date(),
      },
    });
  }
}
