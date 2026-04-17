import { Prisma, User } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { BaseRepository } from './BaseRepository';
import { config } from '../config/env';
import { paginate } from '../utils/date-utils';
import prisma, { softDelete } from '../utils/prisma';

export class UserRepository extends BaseRepository<User, Prisma.UserCreateInput, Prisma.UserUpdateInput> {
  constructor(prismaClient: PrismaClient = prisma) {
    super(prismaClient);
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { id: parseInt(id), deletedAt: null } });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({ where: { deletedAt: null }, orderBy: { name: 'asc' } });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({ where: { id: parseInt(id) }, data });
  }

  async delete(id: string): Promise<void> {
    await softDelete(this.prisma.user, parseInt(id));
  }

  // ============================================================================
  // SPECIALIZED METHODS - Custom business logic
  // ============================================================================

  async findAllPaged({
    search,
    role,
    excludeRoles,
    page = 1,
    limit = config.defaultPageLimit,
  }: {
    search?: string;
    role?: string;
    excludeRoles?: string[];
    page?: number;
    limit?: number;
  }) {
    const where: Prisma.UserWhereInput = { deletedAt: null };

    if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'USER' || role === 'ARTIST') {
      where.role = role;
    } else if (excludeRoles?.length) {
      where.role = { notIn: excludeRoles as any };
    }

    if (search?.trim()) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        omit: { password: true },
      }),
      this.prisma.user.count({ where }),
    ]);

    return paginate(data, total, page, limit);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findFirst({ where: { email, deletedAt: null } });
  }

  async updateById(id: number, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
      omit: { password: true },
    });
  }

  async updatePassword(id: number, hashedPassword: string) {
    return this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
      omit: { password: true },
    });
  }
}
