import { IBookingRepository } from '../contracts/IBookingRepository';
import { BookingHistory } from '../domain/BookingHistory';

export class GetBookingHistory {
  constructor(private bookingRepository: IBookingRepository) {}

  async execute(bookingId: number): Promise<BookingHistory[]> {
    return this.bookingRepository.getHistory(bookingId);
  }
}
