import { IBookingPlacementRepository } from '../contracts/IBookingPlacementRepository';
import { BookingPlacement, BookingPlacementProps } from '../domain/BookingPlacement';

export class BookingPlacementService {
  constructor(private readonly placementRepository: IBookingPlacementRepository) {}

  async getPlacementByBookingId(bookingId: number): Promise<BookingPlacement | null> {
    return this.placementRepository.findByBookingId(bookingId);
  }

  async savePlacement(props: BookingPlacementProps): Promise<BookingPlacement> {
    const placement = new BookingPlacement(props);
    return this.placementRepository.save(placement);
  }
}
