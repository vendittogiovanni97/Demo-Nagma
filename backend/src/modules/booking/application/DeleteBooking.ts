import { IBookingRepository } from '../contracts/IBookingRepository';

export class DeleteBooking {
  constructor(private bookingRepository: IBookingRepository) {}

  async execute(id: number, changedById?: number): Promise<void> {
    return this.bookingRepository.executeInTransaction(async (repo, tx) => {
      const oldBooking = await repo.findById(id);
      if (!oldBooking) return;

      await repo.update(id, { status: 'CANCELLATO', price: 0 } as any);
      
      await tx.bookingHistory.create({
        data: {
          bookingId: id,
          action: 'CANCELLATO',
          oldDate: oldBooking.date,
          changedById,
        },
      });

      await tx.transaction.deleteMany({
        where: {
          sourceId: id,
          sourceType: { in: ['BOOKING', 'BOOKING_COMMISSION'] },
        },
      });
    });
  }
}
