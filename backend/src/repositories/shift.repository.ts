import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

export class ShiftRepository {
  async findByWeek(weekStart: Date) {
    return prisma.shift.findMany({
      where: { 
        weekStart: { equals: weekStart } 
      },
      include: { user: true }
    });
  }

  async create(data: Prisma.ShiftCreateInput) {
    return prisma.shift.create({ data });
  }

  async update(id: string, data: Prisma.ShiftUpdateInput) {
    return prisma.shift.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.shift.delete({ where: { id } }); // Nessun deletedAt previsto dallo schema originario su Shift
  }
}
