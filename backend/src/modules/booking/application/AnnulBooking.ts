import { IBookingRepository } from '../contracts/IBookingRepository';

export class AnnulBooking {
  constructor(private bookingRepository: IBookingRepository) {}

  async execute(id: number, changedById?: number): Promise<void> {
    return this.bookingRepository.executeInTransaction(async (repo, tx) => {
      const oldBooking = await repo.findById(id);
      if (!oldBooking) return;

      await repo.update(id, { status: 'ANNULLATO', price: 0 } as any);
      
      await tx.bookingHistory.create({
        data: {
          bookingId: id,
          action: 'ANNULLATO',
          oldDate: oldBooking.date,
          changedById,
        },
      });

      if (oldBooking.price) {
        await tx.transaction.deleteMany({
          where: { description: { contains: `#${id}` } },
        });
      }
    });
  }
}
