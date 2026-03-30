import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

export class UserRepository {
  async findAll() {
    return prisma.user.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data });
  }
}
