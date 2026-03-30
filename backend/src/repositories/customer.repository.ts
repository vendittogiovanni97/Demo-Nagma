import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

export class CustomerRepository {
  async findAll() {
    return prisma.customer.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { bookings: { where: { deletedAt: null } } }
        }
      }
    });
  }

  async findById(id: string) {
    return prisma.customer.findFirst({
      where: { id, deletedAt: null },
      include: {
        bookings: {
          where: { deletedAt: null },
          orderBy: { date: 'desc' }
        }
      }
    });
  }

  async create(data: Prisma.CustomerCreateInput) {
    return prisma.customer.create({ data });
  }

  async update(id: string, data: Prisma.CustomerUpdateInput) {
    return prisma.customer.update({
      where: { id },
      data
    });
  }

  async softDelete(id: string) {
    return prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  async search(query: string) {
    return prisma.customer.findMany({
      where: {
        deletedAt: null,
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query } }
        ]
      }
    });
  }
}
