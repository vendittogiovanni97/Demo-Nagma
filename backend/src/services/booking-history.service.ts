import prisma from '../utils/prisma';
import { BookingStatus } from '@prisma/client';
import { configService } from './config.service';
import { buildPagination, paginate } from '../utils/date-utils';

export class BookingHistoryService {
  private readonly defaultInclude = {
    booking: {
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
        artist: {
          select: {
            id: true,
            name: true,
            type: true,
            color: true,
          },
        },
      },
    },
    changedBy: {
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    },
  };

  async getHistoryPaged(
    page: number,
    limit: number = configService.getMaxPageLimitSync(),
    filters: {
      startDate?: string;
      endDate?: string;
      action?: BookingStatus;
      userId?: number;
      changedBy?: string;
    }
  ) {
    const where: any = {};

    if (filters.startDate || filters.endDate) {
      where.changedAt = {};
      if (filters.startDate) {
        where.changedAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.changedAt.lte = new Date(filters.endDate);
      }
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.changedBy) {
      where.changedById = parseInt(filters.changedBy) || undefined;
    }

    const [data, total] = await prisma.$transaction([
      prisma.bookingHistory.findMany({
        where,
        ...buildPagination(page, limit),
        orderBy: { changedAt: 'desc' },
        include: this.defaultInclude,
      }),
      prisma.bookingHistory.count({ where }),
    ]);

    return paginate(data, total, page, limit);
  }

  async getHistoryByBooking(bookingId: number) {
    return prisma.bookingHistory.findMany({
      where: { bookingId },
      orderBy: { changedAt: 'desc' },
    });
  }
}