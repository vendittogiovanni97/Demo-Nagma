import prisma from '../utils/prisma';
import { BookingRepository } from '../repositories/booking.repository';
import { validate, CreateBookingSchema, UpdateBookingSchema } from '../utils/validators';

const repository = new BookingRepository();

export class BookingService {
  async getBookings(month?: string) {
    return repository.findAll(month);
  }

  async getStats(month?: string) {
    return repository.getStats(month);
  }

  async createBooking(body: unknown) {
    const data = validate(CreateBookingSchema, body);
    return repository.create({
      customer: { connect: { id: data.customerId } },
      artist: { connect: { id: data.artistId } },
      date: new Date(data.date),
      duration: data.duration ?? 60,
      type: data.type ?? 'Tattoo',
      price: data.price ?? null,
      deposit: data.deposit ?? null,
      notes: data.notes,
    });
  }

  async updateBooking(id: string, body: unknown) {
    const data = validate(UpdateBookingSchema, body);
    const booking = await repository.update(id, data);

    // Se la prenotazione è completata e ha un prezzo, genera automaticamente una transazione di incasso
    if (data.status === 'COMPLETED' && booking.price) {
      await prisma.transaction.create({
        data: {
          type: 'INCOME',
          category: 'Tatuaggio',
          description: `Incasso prenotazione ${booking.type} — Cliente ID: ${booking.customerId}`,
          amount: booking.price,
          date: new Date(),
        },
      });
    }

    return booking;
  }

  async deleteBooking(id: string) {
    return repository.softDelete(id);
  }
}
