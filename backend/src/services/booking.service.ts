import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { config } from '../config/env';
import { BookingRepository } from '../repositories/booking.repository';
import { validate, CreateBookingSchema, UpdateBookingSchema } from '../utils/validators';
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
    const data = validate(CreateBookingSchema, body);
    const startDate = new Date(data.date);
    const duration = data.duration ?? config.defaultBookingDurationMinutes;

    await this.assertNoConflict(data.artistId, startDate, duration);

    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          customer: { connect: { id: data.customerId } },
          artist: { connect: { id: data.artistId } },
          date: startDate,
          duration,
          type: data.type ?? config.defaultBookingType,
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

  async updateBooking(id: string, body: unknown, changedBy: string = 'system') {
    const data = validate(UpdateBookingSchema, body);

    const oldBooking = await repository.findById(id);
    if (!oldBooking || oldBooking.deletedAt) {
      throw new AppError('Prenotazione non trovata', 404, 'NOT_FOUND');
    }

    // Conflict check se cambia data, durata o artista
    const newDate = data.date ? new Date(data.date) : oldBooking.date;
    const newDuration = data.duration ?? oldBooking.duration;
    const newStatus = data.status ?? oldBooking.status;

    if (newStatus !== 'CANCELLED' && (data.date || data.duration)) {
      await this.assertNoConflict(oldBooking.artistId, newDate, newDuration, id);
    }

    return prisma.$transaction(async (tx) => {
      const { formData: rawFormData, ...rest } = data;
      const booking = await tx.booking.update({
        where: { id },
        data: {
          ...rest,
          ...(rawFormData !== undefined && { formData: rawFormData as Prisma.InputJsonValue }),
        },
      });

      const action =
        data.status === 'CANCELLED' ? 'CANCELLED'
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

      // Se la prenotazione è completata e ha un prezzo, genera automaticamente
      // una transazione di incasso (idempotente: solo se non era già COMPLETED).
      // Usa il guadagno studio (studioProfit da formData) se presente, altrimenti il prezzo pieno.
      if (
        data.status === 'COMPLETED' &&
        oldBooking.status !== 'COMPLETED' &&
        booking.price
      ) {
        const fd = booking.formData as Record<string, unknown> | null;
        const studioProfit = fd && typeof fd.studioProfit === 'number'
          ? fd.studioProfit
          : booking.price;

        await tx.transaction.create({
          data: {
            type: 'INCOME',
            category: 'Tatuaggio',
            description: `Incasso prenotazione ${booking.type} — Cliente ID: ${booking.customerId}`,
            amount: studioProfit,
            date: new Date(),
          },
        });
      }

      return booking;
    });
  }

  async getHistory(bookingId: string) {
    return prisma.bookingHistory.findMany({
      where: { bookingId },
      orderBy: { changedAt: 'desc' },
    });
  }

  async deleteBooking(id: string) {
    return repository.softDelete(id);
  }

  private async assertNoConflict(
    artistId: string,
    start: Date,
    duration: number,
    excludeId?: string
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
}
