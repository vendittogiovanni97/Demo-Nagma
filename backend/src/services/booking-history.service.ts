import prisma from '../utils/prisma';
import { BookingHistoryRepository } from '../repositories/booking-history.repository';
import { BookingAction } from '@prisma/client';

const repository = new BookingHistoryRepository();

export class BookingHistoryService {
  async getHistoryPaged(
    page: number,
    limit: number,
    filters: {
      startDate?: string;
      endDate?: string;
      action?: BookingAction;
      userId?: number;
      changedBy?: string;
    }
  ) {
    const { userId, ...rest } = filters;
    return repository.findAllPaged({ ...rest, page, limit });
  }

  async getHistoryByBooking(bookingId: number) {
    return prisma.bookingHistory.findMany({
      where: { bookingId },
      orderBy: { changedAt: 'desc' },
    });
  }
}