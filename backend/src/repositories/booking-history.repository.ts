import { Prisma, BookingHistory, BookingAction, PrismaClient } from '@prisma/client';
import { BaseRepository } from './BaseRepository';
import { config } from '../config/env';
import { paginate } from '../utils/date-utils';
import prisma from '../utils/prisma';
import { configService } from '../services/config.service';

/**
 * BookingHistoryRepository - Optimized for eliminating N+1 queries
 *
 * Query Optimization Strategy:
 * - All methods use Prisma include() to batch-load related data in single queries
 * - Related models (Booking, Customer, Artist, User) loaded eagerly with booking history
 * - Results: Reduced from N+1 queries to 1-2 queries per operation
 *
 * Before: findAllPaged returned 1 + N*3 queries (1 main + N for booking + N for customer + N for artist)
 * After: findAllPaged returns 1 query (all relationships loaded via include)
 */
export class BookingHistoryRepository extends BaseRepository<BookingHistory, Prisma.BookingHistoryCreateInput, Prisma.BookingHistoryUpdateInput> {
  constructor(prismaClient: PrismaClient = prisma) {
    super(prismaClient);
  }

  /**
   * Optimized include strategy for booking history with related data
   * Loads booking + customer + artist + user in single query
   */
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

  async create(data: Prisma.BookingHistoryCreateInput): Promise<BookingHistory> {
    // create() returns full record; include related data for consistency
    return this.prisma.bookingHistory.create({
      data,
      include: this.defaultInclude,
    });
  }

  /**
   * findById with eager loading of related data (1 query total)
   * Before: 1 query for history + separate queries if caller needs booking/user
   * After: 1 query with all relationships included
   */
  async findById(id: number): Promise<(BookingHistory & { booking?: any; changedBy?: any }) | null> {
    return this.prisma.bookingHistory.findUnique({
      where: { id },
      include: this.defaultInclude,
    });
  }

  /**
   * findAll with eager loading (1 query total)
   * Before: 1 query for histories + N queries if caller iterates and needs relationships
   * After: 1 query with all relationships batched via include
   */
  async findAll(): Promise<(BookingHistory & { booking?: any; changedBy?: any })[]> {
    return this.prisma.bookingHistory.findMany({
      orderBy: { changedAt: 'desc' },
      include: this.defaultInclude,
    });
  }

  async update(id: number, data: Prisma.BookingHistoryUpdateInput): Promise<BookingHistory> {
    // update() returns updated record with all relationships loaded
    return this.prisma.bookingHistory.update({
      where: { id },
      data,
      include: this.defaultInclude,
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.bookingHistory.delete({ where: { id } });
  }

  /**
   * findAllPaged with batch-loaded relationships (2 queries total)
   * - Query 1: findMany with include (all relationships loaded in single query)
   * - Query 2: count (separate for pagination metadata)
   *
   * Before: 1 findMany + 1 count + N*(1 booking + 1 customer + 1 artist + 1 user) = 2 + 4N queries
   * After: 1 findMany + 1 count = 2 queries (relationships batch-loaded via include)
   *
   * Example with limit=10:
   * Before: 2 + 40 = 42 queries
   * After: 2 queries (95% reduction)
   */
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

    // Single transaction with 2 queries instead of N+1
    // Query 1: findMany with eager-loaded relationships via include
    // Query 2: count for pagination
    const [data, total] = await this.prisma.$transaction([
      this.prisma.bookingHistory.findMany({
        where,
        ...this.buildPagination(page, limit),
        orderBy: { changedAt: 'desc' },
        // Batch-load all relationships in single query instead of N+1
        include: this.defaultInclude,
      }),
      this.prisma.bookingHistory.count({ where }),
    ]);

    return paginate(data, total, page, limit);
  }
}