import { IBookingRepository, BookingFilters } from '../contracts/IBookingRepository';
import { IPaginatedResponse } from '../../../shared/kernel/interfaces';
import { Booking } from '../domain/Booking';

export class ListBookings {
  constructor(private bookingRepository: IBookingRepository) {}

  async execute(filters: BookingFilters): Promise<IPaginatedResponse<Booking> | { data: Booking[], total: number, hasMore: boolean }> {
    if (filters.page) {
      return this.bookingRepository.findAllPaged(filters);
    }
    return this.bookingRepository.findAllSimple(filters);
  }
}
