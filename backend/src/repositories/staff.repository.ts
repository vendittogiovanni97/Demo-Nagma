import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

export class StaffRepository {
  async findAll() {
    return prisma.staff.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    return prisma.staff.findUnique({ where: { id } });
  }

  async create(data: Prisma.StaffCreateInput) {
    return prisma.staff.create({ data });
  }

  async update(id: string, data: Prisma.StaffUpdateInput) {
    return prisma.staff.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.staff.delete({ where: { id } });
  }
}
