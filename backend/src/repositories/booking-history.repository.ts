import { Prisma, BookingHistory, BookingAction, PrismaClient } from '@prisma/client';
import { BaseRepository } from './BaseRepository';
import { config } from '../config/env';
import { paginate } from '../utils/date-utils';
import prisma from '../utils/prisma';
import { configService } from '../services/config.service';

export class BookingHistoryRepository extends BaseRepository<BookingHistory, Prisma.BookingHistoryCreateInput, Prisma.BookingHistoryUpdateInput> {
  constructor(prismaClient: PrismaClient = prisma) {
    super(prismaClient);
  }

  async create(data: Prisma.BookingHistoryCreateInput): Promise<BookingHistory> {
    return this.prisma.bookingHistory.create({ data });
  }

  async findById(id: number): Promise<BookingHistory | null> {
    return this.prisma.bookingHistory.findUnique({ where: { id } });
  }

  async findAll(): Promise<BookingHistory[]> {
    return this.prisma.bookingHistory.findMany({
      orderBy: { changedAt: 'desc' },
    });
  }

  async update(id: number, data: Prisma.BookingHistoryUpdateInput): Promise<BookingHistory> {
    return this.prisma.bookingHistory.update({ where: { id }, data });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.bookingHistory.delete({ where: { id } });
  }

  async findAllPaged({
    startDate,
    endDate,
    action,
    changedBy,
    page = 1,
    limit = configService.getMaxPageLimitSync(),
  }: {
    startDate?: string;
    endDate?: string;
    action?: BookingAction;
    changedBy?: string;
    page?: number;
    limit?: number;
  }) {
    const where: Prisma.BookingHistoryWhereInput = {};

    if (startDate || endDate) {
      where.changedAt = {};
      if (startDate) {
        where.changedAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.changedAt.lte = new Date(endDate);
      }
    }

    if (action) {
      where.action = action;
    }

    if (changedBy) {
      where.changedById = parseInt(changedBy) || undefined;
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.bookingHistory.findMany({
        where,
        ...this.buildPagination(page, limit),
        orderBy: { changedAt: 'desc' },
        include: {
          booking: {
            include: {
              customer: true,
              artist: true,
            },
          },
          changedBy: true,
        },
      }),
      this.prisma.bookingHistory.count({ where }),
    ]);

    return paginate(data, total, page, limit);
  }
}