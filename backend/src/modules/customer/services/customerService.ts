import { Prisma } from '@prisma/client';
import prisma from '../../../core/shared/utils/prisma';
import { paginate, buildPagination } from '../../../core/shared/kernel/pagination';
import type { IPaginatedResponse } from '../../../core/shared/kernel/interfaces';
import { AppError } from '../../../core/shared/errors/AppError';

export class CustomerService {
  async search(params: Record<string, unknown>): Promise<IPaginatedResponse<unknown>> {
    const { search, page: pageStr = '1', limit: limitStr = '25' } = params as { search?: string; page?: string | number; limit?: string | number };
    const page = Number(pageStr);
    const limit = Number(limitStr);

    const where: Prisma.CustomerWhereInput = { deletedAt: null };
    if (search?.trim()) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const [raws, total] = await prisma.$transaction([
      prisma.customer.findMany({
        where,
        ...buildPagination(page, limit),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { bookings: { where: { deletedAt: null } } },
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return paginate(raws, total, page, limit);
  }

  async getById(id: number) {
    const customer = await prisma.customer.findFirst({
      where: { id, deletedAt: null },
      include: {
        bookings: {
          where: { deletedAt: null },
          orderBy: { date: 'desc' },
          include: { artist: true },
        },
        whatsappLogs: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!customer) return null;
    return {
      ...customer,
      bookings: customer.bookings.map((b) => ({
        ...b,
        price: b.price != null ? Number(b.price) : null,
        deposit: b.deposit != null ? Number(b.deposit) : null,
      })),
    };
  }

  async getSummary(id: number) {
    const customer = await prisma.customer.findFirst({
      where: { id, deletedAt: null },
    });
    if (!customer) return null;

    const [aggregateResult, bookingsResult, upcomingCount] = await prisma.$transaction([
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
      prisma.booking.count({
        where: {
          customerId: id,
          deletedAt: null,
          OR: [
            { status: { in: ['CREATO', 'CONFERMATO'] } },
            { date: { gt: new Date() } },
          ],
        },
      }),
    ]);

    const totalSpent = aggregateResult._sum.price ? aggregateResult._sum.price.toNumber() : 0;
    const upcomingBookings = upcomingCount;
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

  async create(data: { firstName: string; lastName: string; phone: string; email?: string; notes?: string }) {
    const existingByPhone = await prisma.customer.findFirst({
      where: { phone: data.phone, deletedAt: null },
    });
    if (existingByPhone) {
      throw new AppError(`Un cliente con questo numero di telefono (${data.phone}) esiste già.`, 409, 'DUPLICATE_PHONE');
    }

    const existingByName = await prisma.customer.findFirst({
      where: {
        firstName: { equals: data.firstName, mode: 'insensitive' },
        lastName: { equals: data.lastName, mode: 'insensitive' },
        deletedAt: null,
      },
    });
    if (existingByName) {
      throw new AppError(`Un cliente con nome "${data.firstName} ${data.lastName}" esiste già.`, 409, 'DUPLICATE_NAME');
    }

    const created = await prisma.customer.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email,
        notes: data.notes,
      },
    });

    return created;
  }

  async update(id: number, data: { firstName?: string; lastName?: string; phone?: string; email?: string | null; notes?: string | null }) {
    const currentCustomer = await prisma.customer.findFirst({
      where: { id, deletedAt: null },
    });
    if (!currentCustomer) {
      throw new AppError('Cliente non trovato.', 404, 'CUSTOMER_NOT_FOUND');
    }

    if (data.phone) {
      const existingByPhone = await prisma.customer.findFirst({
        where: { phone: data.phone, deletedAt: null },
      });
      if (existingByPhone && existingByPhone.id !== id) {
        throw new AppError(`Un altro cliente possiede già questo numero di telefono (${data.phone}).`, 409, 'DUPLICATE_PHONE');
      }
    }

    if (data.firstName || data.lastName) {
      {
        const newFirstName = data.firstName || currentCustomer.firstName;
        const newLastName = data.lastName || currentCustomer.lastName;

        const existingByName = await prisma.customer.findFirst({
          where: {
            firstName: { equals: newFirstName, mode: 'insensitive' },
            lastName: { equals: newLastName, mode: 'insensitive' },
            deletedAt: null,
          },
        });
        if (existingByName && existingByName.id !== id) {
          throw new AppError(`Un altro cliente si chiama già "${newFirstName} ${newLastName}".`, 409, 'DUPLICATE_NAME');
        }
      }
    }

    const dataToUpdate = { ...data };
    if (dataToUpdate.email !== undefined) {
      dataToUpdate.email = dataToUpdate.email || undefined;
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: dataToUpdate,
    });

    return updated;
  }

  async delete(id: number) {
    const result = await prisma.customer.updateMany({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    if (result.count === 0) {
      throw new AppError('Cliente non trovato.', 404, 'CUSTOMER_NOT_FOUND');
    }
  }
}
