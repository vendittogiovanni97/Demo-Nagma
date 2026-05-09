import { BookingPlacement } from '../domain/BookingPlacement';

export interface IBookingPlacementRepository {
  findByBookingId(bookingId: number): Promise<BookingPlacement | null>;
  save(placement: BookingPlacement): Promise<BookingPlacement>;
}
