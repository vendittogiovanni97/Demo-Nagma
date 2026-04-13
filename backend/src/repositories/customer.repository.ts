import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';

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

export class CustomerRepository {
  async findAllPaged(search?: string, page = 1, limit = 20) {
    const where = buildWhere(search);
    const skip = (page - 1) * limit;

    const [data, total] = await prisma.$transaction([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: baseInclude,
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string) {
    return prisma.customer.findFirst({
      where: { id, deletedAt: null },
      include: {
        bookings: {
          where: {
            deletedAt: null,
            artist: { is: { deletedAt: null } },
          },
          include: {
            artist: {
              select: { id: true, name: true, color: true },
            },
          },
          orderBy: { date: 'desc' },
        },
        creamSales: {
          where: {
            deletedAt: null,
            cream: { is: { deletedAt: null } },
          },
          include: { cream: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
        whatsappLogs: {
          where: {
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
          include: {
            template: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  async getCustomerSummary(id: string) {
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
        _count: {
          select: {
            bookings: { where: { deletedAt: null } },
            creamSales: { where: { deletedAt: null } },
          },
        },
      },
    });

    if (!customer) return null;

    const [totalSpent, upcomingBookings, lastBooking] = await prisma.$transaction([
      prisma.booking.aggregate({
        where: { customerId: id, deletedAt: null, status: 'COMPLETED' },
        _sum: { price: true },
      }),
      prisma.booking.count({
        where: { customerId: id, deletedAt: null, date: { gte: new Date() } },
      }),
      prisma.booking.findFirst({
        where: { customerId: id, deletedAt: null },
        orderBy: { date: 'desc' },
        select: { date: true, type: true, status: true, artist: { select: { name: true } } },
      }),
    ]);

    return {
      ...customer,
      totalSpent: totalSpent._sum.price || 0,
      upcomingBookings,
      lastBooking,
    };
  }

  async create(data: Prisma.CustomerCreateInput) {
    return prisma.customer.create({ data });
  }

  async update(id: string, data: Prisma.CustomerUpdateInput) {
    return prisma.customer.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
