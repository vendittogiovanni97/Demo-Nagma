import { Prisma, Customer } from '@prisma/client';
import { getMonthRange, paginate, buildPagination as paginateOpts } from '../utils/date-utils';
import prisma, { softDelete } from '../utils/prisma';
import { parseId } from '../utils/parse-id';
import { config } from '../config/env';
import { configService } from './config.service';

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

export class CustomerService {
  async create(data: Prisma.CustomerCreateInput): Promise<Customer> {
    return prisma.customer.create({ data });
  }

  async findById(id: string | number): Promise<Customer | null> {
    const customerId = parseId(String(id));

    const [customer, bookings, whatsappLogs] = await Promise.all([
      prisma.customer.findFirst({
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

      prisma.booking.findMany({
        where: { customerId, deletedAt: null },
        include: {
          artist: { select: { id: true, name: true, color: true } },
        },
        orderBy: { date: 'desc' },
      }),

      prisma.whatsAppMessageLog.findMany({
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

    if (!customer) {
      return null;
    }

    return {
      ...customer,
      bookings,
      whatsappLogs,
    } as unknown as Customer;
  }

  async findAll(): Promise<Customer[]> {
    return prisma.customer.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string | number, data: Prisma.CustomerUpdateInput): Promise<Customer> {
    const customerId = parseId(String(id));
    return prisma.customer.update({ where: { id: customerId }, data });
  }

  async delete(id: string | number): Promise<void> {
    const customerId = parseId(String(id));
    await softDelete(prisma.customer, customerId);
  }

  async softDelete(id: string | number): Promise<void> {
    await this.delete(id);
  }

  async findAllPaged(search?: string, page = 1, limit = configService.getMaxPageLimitSync(), startDate?: string, endDate?: string) {
    const where = buildWhere(search, startDate, endDate);

    const [data, total] = await prisma.$transaction([
      prisma.customer.findMany({
        where,
        ...paginateOpts(page, limit),
        orderBy: { createdAt: 'desc' },
        include: baseInclude,
      }),
      prisma.customer.count({ where }),
    ]);

    return paginate(data, total, page, limit);
  }

  async getCustomerSummary(id: number) {
    const customer = await prisma.customer.findFirst({
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

    const [aggregateResult, bookingsResult] = await prisma.$transaction([
      prisma.booking.aggregate({
        where: { customerId: id, status: 'COMPLETATO', deletedAt: null },
        _sum: { price: true },
      }),
      prisma.booking.findMany({
        where: { customerId: id, deletedAt: null },
        select: { date: true, status: true, price: true, artist: { select: { name: true } } },
        orderBy: { date: 'desc' },
        take: 5,
      }),
    ]);

    const totalSpent = aggregateResult._sum.price ? aggregateResult._sum.price.toNumber() : 0;
    const upcomingBookings = bookingsResult.filter((b) => b.status === 'CONFERMATO' || b.status === 'CREATO' || b.date > new Date()).length;
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
