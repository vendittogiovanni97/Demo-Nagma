import prisma from '../../../core/shared/utils/prisma';
import { paginate, buildPagination } from '../../../core/shared/kernel/pagination';
import type { IPaginatedResponse } from '../../../core/shared/kernel/interfaces';

export class CustomerService {
  async search(params: Record<string, unknown>): Promise<IPaginatedResponse<any>> {
    const { search, page: pageStr = '1', limit: limitStr = '20' } = params as any;
    const page = Number(pageStr);
    const limit = Number(limitStr);

    const where: any = { deletedAt: null };
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
    });
    return customer;
  }

  async getSummary(id: number) {
    const customer = await prisma.customer.findFirst({
      where: { id, deletedAt: null },
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
    const upcomingBookings = bookingsResult.filter(
      (b) => b.status === 'CONFERMATO' || b.status === 'CREATO' || b.date > new Date()
    ).length;
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
      throw new Error(`Un cliente con questo numero di telefono (${data.phone}) esiste già.`);
    }

    const existingByName = await prisma.customer.findFirst({
      where: {
        firstName: { equals: data.firstName, mode: 'insensitive' },
        lastName: { equals: data.lastName, mode: 'insensitive' },
        deletedAt: null,
      },
    });
    if (existingByName) {
      throw new Error(`Un cliente con nome "${data.firstName} ${data.lastName}" esiste già.`);
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

  async update(id: number, data: any) {
    if (data.phone) {
      const existingByPhone = await prisma.customer.findFirst({
        where: { phone: data.phone, deletedAt: null },
      });
      if (existingByPhone && existingByPhone.id !== id) {
        throw new Error(`Un altro cliente possiede già questo numero di telefono (${data.phone}).`);
      }
    }

    if (data.firstName || data.lastName) {
      const current = await prisma.customer.findFirst({
        where: { id, deletedAt: null },
      });
      if (current) {
        const newFirstName = data.firstName || current.firstName;
        const newLastName = data.lastName || current.lastName;

        const existingByName = await prisma.customer.findFirst({
          where: {
            firstName: { equals: newFirstName, mode: 'insensitive' },
            lastName: { equals: newLastName, mode: 'insensitive' },
            deletedAt: null,
          },
        });
        if (existingByName && existingByName.id !== id) {
          throw new Error(`Un altro cliente si chiama già "${newFirstName} ${newLastName}".`);
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
    await prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
