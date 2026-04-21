import { Prisma, User } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { BaseRepository } from './BaseRepository';
import { config } from '../config/env';
import { paginate } from '../utils/date-utils';
import prisma, { softDelete } from '../utils/prisma';
import { parseId } from '../utils/parse-id';

export class UserRepository extends BaseRepository<User, Prisma.UserCreateInput, Prisma.UserUpdateInput> {
  constructor(prismaClient: PrismaClient = prisma) {
    super(prismaClient);
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async findById(id: string | number): Promise<User | null> {
    const userId = parseId(String(id));
    return this.prisma.user.findFirst({ where: { id: userId, deletedAt: null } });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({ where: { deletedAt: null }, orderBy: { name: 'asc' } });
  }

  async update(id: string | number, data: Prisma.UserUpdateInput): Promise<User> {
    const userId = parseId(String(id));
    return this.prisma.user.update({ where: { id: userId }, data });
  }

  async delete(id: string | number): Promise<void> {
    const userId = parseId(String(id));
    await softDelete(this.prisma.user, userId);
  }

  async softDelete(id: string | number): Promise<void> {
    await this.delete(id);
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

    if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
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

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        ...this.buildPagination(page, limit),
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
