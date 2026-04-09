import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

export class ShiftRepository {
  async findByWeek(weekStart: Date) {
    return prisma.shift.findMany({
      where: { 
        weekStart: { equals: weekStart },
        deletedAt: null
      },
      include: { user: { omit: { password: true } } }
    });
  }

  async create(data: Prisma.ShiftCreateInput) {
    return prisma.shift.create({ data });
  }

  async update(id: string, data: Prisma.ShiftUpdateInput) {
    return prisma.shift.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return prisma.shift.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}

