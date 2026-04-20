import prisma from '../utils/prisma';
import { Prisma, Staff } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { BaseRepository } from './BaseRepository';
import { paginate } from '../utils/date-utils';
import { parseId } from '../utils/parse-id';

export class StaffRepository extends BaseRepository<Staff, Prisma.StaffCreateInput, Prisma.StaffUpdateInput> {
  constructor(prismaClient: PrismaClient = prisma) {
    super(prismaClient);
  }

  async create(data: Prisma.StaffCreateInput): Promise<Staff> {
    return this.prisma.staff.create({ data });
  }

  async findById(id: string | number): Promise<Staff | null> {
    const staffId = parseId(String(id));
    return this.prisma.staff.findUnique({ where: { id: staffId } });
  }

  async findAll(): Promise<Staff[]> {
    return this.prisma.staff.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string | number, data: Prisma.StaffUpdateInput): Promise<Staff> {
    const staffId = parseId(String(id));
    return this.prisma.staff.update({ where: { id: staffId }, data });
  }

  async delete(id: string | number): Promise<void> {
    const staffId = parseId(String(id));
    await this.prisma.staff.delete({ where: { id: staffId } });
  }

  // ============================================================================
  // SPECIALIZED METHODS - Custom business logic
  // ============================================================================

  async findAllPaged({
    search,
    type,
    page = 1,
    limit = 20,
  }: {
    search?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) {
    const where: Prisma.StaffWhereInput = {};

    if (type) {
      where.type = type as any;
    }

    if (search?.trim()) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.staff.findMany({
        where,
        ...this.buildPagination(page, limit),
        orderBy: { name: 'asc' },
      }),
      this.prisma.staff.count({ where }),
    ]);

    return paginate(data, total, page, limit);
  }

  /**
   * Recupera tutto lo staff con i relativi turni (filtrati in app logic nel service)
   */
  async findAllShifts() {
    return this.prisma.staff.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        color: true,
        shifts: true,
      },
      orderBy: { name: 'asc' },
    });
  }
}
