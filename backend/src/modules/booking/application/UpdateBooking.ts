import { IBookingRepository } from '../contracts/IBookingRepository';
import { UpdateBookingDTO } from '../contracts/BookingDTOs';
import { Booking, BookingStatus } from '../domain/Booking';
import { BookingHistory } from '../domain/BookingHistory';
import { AppError } from '../../../shared/errors/AppError';

export class UpdateBooking {
  constructor(private bookingRepository: IBookingRepository) {}

  async execute(id: number, data: UpdateBookingDTO, changedById?: number): Promise<Booking> {
    const oldBooking = await this.bookingRepository.findById(id);
    if (!oldBooking || oldBooking.deletedAt) {
      throw new AppError('Prenotazione non trovata', 404, 'NOT_FOUND');
    }

    const newDate = data.date ? new Date(data.date) : oldBooking.date;
    const newDuration = data.duration ?? oldBooking.duration;
    const newStatus = data.status ?? oldBooking.status;
    const newArtistId = data.artistId ?? oldBooking.artistId;
    const endDate = new Date(newDate.getTime() + newDuration * 60_000);

    if (newStatus !== 'ANNULLATO' && newStatus !== 'CANCELLATO' && (data.date || data.duration || data.artistId)) {
      const conflictId = await this.bookingRepository.hasConflict(newArtistId, newDate, endDate, id);
      if (conflictId) {
        throw new AppError(
          'Esiste già una prenotazione per questo artista nella fascia oraria selezionata',
          409,
          'BOOKING_CONFLICT',
          { conflictingBookingId: conflictId }
        );
      }
    }

    return this.bookingRepository.executeInTransaction(async (repo, tx) => {
      const updated = await repo.update(id, data as any);

      const action =
        data.status === 'ANNULLATO' || data.status === 'CANCELLATO' ? 'ANNULLATO'
        : data.status === 'COMPLETATO' ? 'COMPLETATO'
        : data.date || data.duration || data.artistId ? 'SPOSTATO'
        : 'MODIFICATO';

      await repo.addHistory(new BookingHistory({
        bookingId: id,
        action,
        oldDate: oldBooking.date,
        newDate: data.date ? new Date(data.date) : null,
        changedById,
      }));

      // Generate transaction if completed
      if (data.status === 'COMPLETATO' && oldBooking.status !== 'COMPLETATO' && updated.price) {
        await this.createIncomeTransaction(tx, updated);
      }

      return updated;
    });
  }

  private async createIncomeTransaction(tx: any, booking: Booking): Promise<void> {
    const fd = booking.formData as Record<string, unknown> | null;
    const artistPrice = fd && typeof fd.artistPrice === 'number' ? fd.artistPrice : 0;
    const fullPrice = booking.price ?? 0;
    const bookingDate = booking.date ?? new Date();

    // INCOME
    await tx.transaction.create({
      data: {
        type: 'INCOME',
        category: 'Tatuaggio',
        description: `Incasso prenotazione #${booking.id}`,
        amount: fullPrice,
        date: bookingDate,
        sourceId: booking.id,
        sourceType: 'BOOKING',
      },
    });

    // EXPENSE (artist commission)
    if (artistPrice > 0) {
      await tx.transaction.create({
        data: {
          type: 'EXPENSE',
          category: 'Compenso Artista',
          description: `Compenso artista — prenotazione #${booking.id}`,
          amount: artistPrice,
          date: bookingDate,
          sourceId: booking.id,
          sourceType: 'BOOKING_COMMISSION',
        },
      });
    }
  }
}
