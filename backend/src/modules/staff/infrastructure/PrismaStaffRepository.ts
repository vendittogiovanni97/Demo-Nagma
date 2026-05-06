import { PrismaClient, Prisma } from '@prisma/client';
import { IStaffRepository, StaffFilters } from '../contracts/IStaffRepository';
import { Staff } from '../domain/Staff';
import { IPaginatedResponse } from '../../../shared/kernel/interfaces';
import { paginate, buildPagination } from '../../../shared/kernel/pagination';
import prismaClient from '../../../shared/utils/prisma';

export class PrismaStaffRepository implements IStaffRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prismaClient;
  }

  private mapToDomain(raw: any): Staff {
    return new Staff({
      id: raw.id,
      name: raw.name,
      type: raw.type as any,
      color: raw.color,
      deletedAt: raw.deletedAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async findById(id: number): Promise<Staff | null> {
    const raw = await this.prisma.staff.findFirst({
      where: { id, deletedAt: null },
    });
    return raw ? this.mapToDomain(raw) : null;
  }

  async findAll(): Promise<Staff[]> {
    const raws = await this.prisma.staff.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
    return raws.map(this.mapToDomain);
  }

  async findAllPaged(filters: StaffFilters): Promise<IPaginatedResponse<Staff>> {
    const { search, type, page = 1, limit = 20 } = filters;
    const where: Prisma.StaffWhereInput = { deletedAt: null };

    if (type) {
      where.type = type as any;
    }

    if (search?.trim()) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [raws, total] = await this.prisma.$transaction([
      this.prisma.staff.findMany({
        where,
        ...buildPagination(page, limit),
        orderBy: { name: 'asc' },
      }),
      this.prisma.staff.count({ where }),
    ]);

    return paginate(raws.map(this.mapToDomain), total, page, limit);
  }

  async create(staff: Staff): Promise<Staff> {
    const data = staff.toJSON();
    const created = await this.prisma.staff.create({
      data: {
        name: data.name,
        type: data.type as any,
        color: data.color || '#00bfff',
      },
    });
    return this.mapToDomain(created);
  }

  async update(id: number, data: Partial<Staff>): Promise<Staff> {
    const updated = await this.prisma.staff.update({
      where: { id },
      data: data as any,
    });
    return this.mapToDomain(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.staff.delete({ where: { id } });
  }

  async softDelete(id: number): Promise<void> {
    await this.prisma.staff.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
