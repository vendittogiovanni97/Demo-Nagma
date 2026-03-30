import { BookingRepository } from '../repositories/booking.repository';

export class BookingService {
  private repository = new BookingRepository();

  async getBookings(monthStr?: string) {
    return this.repository.findAll(monthStr);
  }

  async getStats(monthStr?: string) {
    return this.repository.getStats(monthStr);
  }

  async createBooking(data: any) {
    // Basic val
    if (!data.customerId || !data.artistId || !data.date) {
      throw new Error('customerId, artistId, date sono obbligatori');
    }
    // Outlook sync stub
    const outlookEventId = 'stub_outlook_' + Date.now();
    return this.repository.create({
      customer: { connect: { id: data.customerId } },
      artist: { connect: { id: data.artistId } },
      date: new Date(data.date),
      duration: data.duration || 60,
      type: data.type || 'Tattoo',
      price: data.price ? Number(data.price) : null,
      deposit: data.deposit ? Number(data.deposit) : null,
      notes: data.notes,
      outlookEventId
    });
  }

  async updateBooking(id: string, data: any) {
    return this.repository.update(id, data);
  }

  async deleteBooking(id: string) {
    return this.repository.softDelete(id);
  }
}
