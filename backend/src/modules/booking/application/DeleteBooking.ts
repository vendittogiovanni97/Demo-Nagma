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

      // Create deposit refund expense transaction if booking has deposit and no refund exists yet
      if (oldBooking.deposit && oldBooking.deposit > 0) {
        const existingRefund = await tx.transaction.findFirst({
          where: {
            sourceId: id,
            sourceType: 'BOOKING_REFUND',
          },
        });

        if (!existingRefund) {
          const customerName = oldBooking.customer 
            ? `${oldBooking.customer.firstName} ${oldBooking.customer.lastName || ''}`.trim() 
            : 'Cliente';

          await tx.transaction.create({
            data: {
              type: 'EXPENSE',
              category: 'Acconto',
              description: `Rimborso acconto prenotazione #${oldBooking.id} - ${customerName}`,
              amount: oldBooking.deposit,
              date: new Date(), // Today (date of cancellation refund)
              sourceId: oldBooking.id,
              sourceType: 'BOOKING_REFUND',
            },
          });
        }
      }
    });
  }
}
