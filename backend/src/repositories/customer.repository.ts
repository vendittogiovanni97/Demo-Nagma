import { Prisma, Customer } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { BaseRepository } from './BaseRepository';
import { config } from '../config/env';
import { paginate } from '../utils/date-utils';
import prisma, { softDelete } from '../utils/prisma';
import { parseId } from '../utils/parse-id';

const baseInclude = {
  _count: {
    select: { bookings: { where: { deletedAt: null } } }
  }
} satisfies Prisma.CustomerInclude;

function buildWhere(search?: string): Prisma.CustomerWhereInput {
  const base: Prisma.CustomerWhereInput = { deletedAt: null };
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

  async findById(id: string | number): Promise<Customer | null> {
    const customerId = parseId(String(id));
    return this.prisma.customer.findFirst({
      where: { id: customerId, deletedAt: null },
      include: {
        bookings: {
          where: { deletedAt: null },
          include: {
            artist: { select: { id: true, name: true, color: true } },
          },
          orderBy: { date: 'desc' },
        },
        whatsappLogs: {
          where: {
            createdAt: { gte: new Date(Date.now() - config.whatsappLogsRetentionDays * 24 * 60 * 60 * 1000) },
          },
          include: {
            template: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: config.whatsappLogsFetchLimit,
        },
      },
    });
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

  async findAllPaged(search?: string, page = 1, limit = config.defaultPageLimit) {
    const where = buildWhere(search);

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
        _count: {
          select: {
            bookings: { where: { deletedAt: null } },
          },
        },
        bookings: {
          where: { deletedAt: null },
          select: {
            date: true,
            status: true,
            price: true,
            artist: { select: { name: true } },
          },
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!customer) return null;

    const completedBookings = customer.bookings.filter(b => b.status === 'COMPLETED');
    const totalSpent = completedBookings.reduce((sum, b) => sum + (b.price ?? 0), 0);
    const upcomingBookings = customer.bookings.filter(
      b => b.status !== 'CANCELLED' && new Date(b.date) >= new Date()
    ).length;
    const lastBooking = customer.bookings[0] ?? null;

    const { bookings: _bookings, ...customerFields } = customer;

    return {
      ...customerFields,
      totalSpent,
      upcomingBookings,
      lastBooking,
    };
  }
}
