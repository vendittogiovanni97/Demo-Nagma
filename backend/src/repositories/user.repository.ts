import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';
import { config } from '../config/env';

export class UserRepository {
  async findAllPaged({
    search,
    role,
    page = 1,
    limit = config.defaultPageLimit,
  }: {
    search?: string;
    role?: string;
    page?: number;
    limit?: number;
  }) {
    const where: Prisma.UserWhereInput = { deletedAt: null };

    if (role === 'ADMIN' || role === 'USER' || role === 'ARTIST') {
      where.role = role;
    }

    if (search?.trim()) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [data, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        omit: { password: true },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findById(id: string) {
    return prisma.user.findFirst({ where: { id, deletedAt: null } });
  }

  async findByEmail(email: string) {
    return prisma.user.findFirst({ where: { email, deletedAt: null } });
  }

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}
