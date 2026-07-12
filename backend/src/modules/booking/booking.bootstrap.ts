import { container } from '../../core/container';
import { BookingService } from './services/bookingService';
import { BookingController } from './controllers/booking.controller';

export function bootstrapBooking(): void {
  const bookingService = new BookingService();
  const bookingController = new BookingController(bookingService);
  container.register(BookingService, bookingService);
  container.register(BookingController, bookingController);
}
