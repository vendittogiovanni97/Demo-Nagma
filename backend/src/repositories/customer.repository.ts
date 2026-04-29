import { Prisma, Customer } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { BaseRepository } from './BaseRepository';
import { config } from '../config/env';
import { paginate } from '../utils/date-utils';
import prisma, { softDelete } from '../utils/prisma';
import { parseId } from '../utils/parse-id';
import { configService } from '../services/config.service';

const baseInclude = {
  _count: {
    select: { bookings: { where: { deletedAt: null } } }
  }
} satisfies Prisma.CustomerInclude;

function buildWhere(search?: string, startDate?: string, endDate?: string): Prisma.CustomerWhereInput {
  const base: Prisma.CustomerWhereInput = { deletedAt: null };
  
  if (startDate) {
    base.createdAt = { ...base.createdAt as object, gte: new Date(startDate) };
  }
  if (endDate) {
    base.createdAt = { ...base.createdAt as object, lte: new Date(endDate + 'T23:59:59.999') };
  }
  
  if (!search?.trim()) return base;
  return {
    ...base,
    OR: [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
    ],
  };
}

export class CustomerRepository extends BaseRepository<Customer, Prisma.CustomerCreateInput, Prisma.CustomerUpdateInput> {
  constructor(prismaClient: PrismaClient = prisma) {
    super(prismaClient);
  }

  async create(data: Prisma.CustomerCreateInput): Promise<Customer> {
    return this.prisma.customer.create({ data });
  }

  /**
   * FIX #1: Batch Fetch Pattern to eliminate N+1 queries
   * 
   * BEFORE: 1 customer query + N bookings queries (each with artist) + M whatsappLog queries (each with template)
   *         Result: 1 + N + M queries = ~151 queries for a customer with 50 bookings + 100 logs
   * 
   * AFTER:  Promise.all([customer, bookings with artists, logs with templates])
   *         Result: 3 queries total, all in parallel
   *         Performance gain: 151 queries → 3 queries (98% reduction)
   * 
   * Strategy:
   * 1. Fetch customer base data with minimal select fields
   * 2. Fetch bookings + artist in single query (batch join)
   * 3. Fetch whatsappLogs + template in single query (batch join)
   * 4. Combine results with Promise.all for parallel execution
   */
  async findById(id: string | number): Promise<Customer | null> {
    const customerId = parseId(String(id));

    // Batch fetch pattern: Execute 3 queries in parallel instead of N+1
    const [customer, bookings, whatsappLogs] = await Promise.all([
      // Query 1: Customer base data (only needed fields)
      this.prisma.customer.findFirst({
        where: { id: customerId, deletedAt: null },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      }),

      // Query 2: All bookings for this customer + artists (batch join, no N+1)
      this.prisma.booking.findMany({
        where: { customerId, deletedAt: null },
        include: {
          artist: { select: { id: true, name: true, color: true } },
        },
        orderBy: { date: 'desc' },
      }),

      // Query 3: All whatsappLogs for this customer + templates (batch join, no N+1)
      this.prisma.whatsAppMessageLog.findMany({
        where: {
          customerId,
          createdAt: { gte: new Date(Date.now() - config.whatsappLogsRetentionDays * 24 * 60 * 60 * 1000) },
        },
        include: {
          template: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: config.whatsappLogsFetchLimit,
      }),
    ]);

    // If customer doesn't exist, return null
    if (!customer) {
      return null;
    }

    // Reconstruct object with related data
    return {
      ...customer,
      bookings,
      whatsappLogs,
    } as unknown as Customer;
  }

  async findAll(): Promise<Customer[]> {
    return this.prisma.customer.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string | number, data: Prisma.CustomerUpdateInput): Promise<Customer> {
    const customerId = parseId(String(id));
    return this.prisma.customer.update({ where: { id: customerId }, data });
  }

  async delete(id: string | number): Promise<void> {
    const customerId = parseId(String(id));
    await softDelete(this.prisma.customer, customerId);
  }

  async softDelete(id: string | number): Promise<void> {
    await this.delete(id);
  }

  // ============================================================================
  // SPECIALIZED METHODS - Custom business logic
  // ============================================================================

  async findAllPaged(search?: string, page = 1, limit = configService.getMaxPageLimitSync(), startDate?: string, endDate?: string) {
    const where = buildWhere(search, startDate, endDate);

    const [data, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany({
        where,
        ...this.buildPagination(page, limit),
        orderBy: { createdAt: 'desc' },
        include: baseInclude,
      }),
      this.prisma.customer.count({ where }),
    ]);

    return paginate(data, total, page, limit);
  }

  async getCustomerSummary(id: number) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        notes: true,
        createdAt: true,
      },
    });

    if (!customer) return null;

    const [aggregateResult, bookingsResult] = await this.prisma.$transaction([
      this.prisma.booking.aggregate({
        where: { customerId: id, status: 'COMPLETED', deletedAt: null },
        _sum: { price: true },
      }),
      this.prisma.booking.findMany({
        where: { customerId: id, deletedAt: null },
        select: { date: true, status: true, price: true, artist: { select: { name: true } } },
        orderBy: { date: 'desc' },
        take: 5,
      }),
    ]);

    const totalSpent = aggregateResult._sum.price ? aggregateResult._sum.price.toNumber() : 0;
    const upcomingBookings = bookingsResult.filter((b) => b.status === 'CONFIRMED' || b.date > new Date()).length;
    const lastBookingRaw = bookingsResult[0] ?? null;
    const lastBooking = lastBookingRaw
      ? { ...lastBookingRaw, price: lastBookingRaw.price ? lastBookingRaw.price.toNumber() : null }
      : null;

    return {
      ...customer,
      totalSpent,
      upcomingBookings,
      lastBooking,
    };
  }
}
