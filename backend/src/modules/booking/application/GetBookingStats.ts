import { IBookingRepository } from '../contracts/IBookingRepository';

export class GetBookingStats {
  constructor(private bookingRepository: IBookingRepository) {}

  async execute(month?: string): Promise<any> {
    return this.bookingRepository.getStats(month);
  }
}
