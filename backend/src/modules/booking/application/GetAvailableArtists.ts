import { IBookingRepository } from '../contracts/IBookingRepository';
import { config } from '../../../config/env';

export class GetAvailableArtists {
  constructor(private bookingRepository: IBookingRepository) {}

  async execute(dateIso: string): Promise<any[]> {
    const start = new Date(dateIso);
    const durationMin = config.defaultBookingDurationMinutes;
    const end = new Date(start.getTime() + durationMin * 60_000);

    return this.bookingRepository.getAvailableArtists(start, end);
  }
}
