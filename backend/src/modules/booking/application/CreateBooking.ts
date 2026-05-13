import { IBookingRepository } from '../contracts/IBookingRepository';
import { CreateBookingDTO } from '../contracts/BookingDTOs';
import { Booking } from '../domain/Booking';
import { BookingHistory } from '../domain/BookingHistory';
import { AppError } from '../../../shared/errors/AppError';

export class CreateBooking {
  constructor(private bookingRepository: IBookingRepository) {}

  async execute(data: CreateBookingDTO, changedById?: number): Promise<Booking> {
    const startDate = new Date(data.date);
    const duration = data.duration ?? 120;
    const endDate = new Date(startDate.getTime() + duration * 60_000);

    const conflictId = await this.bookingRepository.hasConflict(data.artistId, startDate, endDate);
    if (conflictId) {
      throw new AppError(
        'Esiste già una prenotazione per questo artista nella fascia oraria selezionata',
        409,
        'BOOKING_CONFLICT',
        { conflictingBookingId: conflictId }
      );
    }

    return this.bookingRepository.executeInTransaction(async (repo, tx) => {
      const booking = new Booking({
        customerId: data.customerId,
        artistId: data.artistId,
        date: startDate,
        duration,
        status: 'CREATO',
        price: data.price,
        deposit: data.deposit,
        notes: data.notes,
        formData: data.formData,
      });

      const saved = await repo.save(booking);

      await repo.addHistory(new BookingHistory({
        bookingId: saved.id!,
        action: 'CREATO',
        newDate: saved.date,
        changedById,
      }));

      // Create deposit transaction if deposit exists
      if (saved.deposit && saved.deposit > 0) {
        const customerName = saved.customer 
          ? `${saved.customer.firstName} ${saved.customer.lastName || ''}`.trim() 
          : 'Cliente';
        
        await tx.transaction.create({
          data: {
            type: 'INCOME',
            category: 'Acconto',
            description: `Acconto prenotazione #${saved.id} - ${customerName}`,
            amount: saved.deposit,
            date: new Date(),
            sourceId: saved.id,
            sourceType: 'BOOKING_DEPOSIT',
          },
        });
      }

      return saved;
    });
  }
}
