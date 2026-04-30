import { Prisma, Staff } from '@prisma/client';
import { paginate, buildPagination as paginateOpts } from '../utils/date-utils';
import prisma from '../utils/prisma';
import { parseId } from '../utils/parse-id';

export class StaffService {
  async create(data: Prisma.StaffCreateInput): Promise<Staff> {
    return prisma.staff.create({ data });
  }

  async findById(id: string | number): Promise<Staff | null> {
    const staffId = parseId(String(id));
    return prisma.staff.findUnique({ where: { id: staffId } });
  }

  async findAll(): Promise<Staff[]> {
    return prisma.staff.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string | number, data: Prisma.StaffUpdateInput): Promise<Staff> {
    const staffId = parseId(String(id));
    return prisma.staff.update({ where: { id: staffId }, data });
  }

  async delete(id: string | number): Promise<void> {
    const staffId = parseId(String(id));
    await prisma.staff.delete({ where: { id: staffId } });
  }

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

    const [data, total] = await prisma.$transaction([
      prisma.staff.findMany({
        where,
        ...paginateOpts(page, limit),
        orderBy: { name: 'asc' },
      }),
      prisma.staff.count({ where }),
    ]);

    return paginate(data, total, page, limit);
  }

  async findAllShifts() {
    return prisma.staff.findMany({
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
