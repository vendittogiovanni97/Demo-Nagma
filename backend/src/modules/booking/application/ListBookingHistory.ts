import { IBookingRepository, BookingHistoryFilters } from '../contracts/IBookingRepository';
import { BookingHistory } from '../domain/BookingHistory';
import { IPaginatedResponse } from '../../../shared/kernel/interfaces';

export class ListBookingHistory {
  constructor(private bookingRepository: IBookingRepository) {}

  async execute(page: number, limit: number, filters: BookingHistoryFilters): Promise<IPaginatedResponse<BookingHistory>> {
    return this.bookingRepository.findAllHistoryPaged(page, limit, filters);
  }
}
