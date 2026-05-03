import { PrismaClient, Prisma } from '@prisma/client';
import { ISpesaLiberaRepository } from '../contracts/ISpesaLiberaRepository';
import { SpesaLibera } from '../domain/SpesaLibera';
import { IPaginatedResponse } from '../../../shared/kernel/interfaces';
import { paginate, buildPagination } from '../../../shared/kernel/pagination';
import { getMonthRange } from '../../../shared/utils/date-utils';
import prismaClient from '../../../shared/utils/prisma';

export class PrismaSpesaLiberaRepository implements ISpesaLiberaRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prismaClient;
  }

  private mapToDomain(raw: any): SpesaLibera {
    return new SpesaLibera({
      id: raw.id,
      name: raw.name,
      price: raw.price,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async findAll(month?: string): Promise<SpesaLibera[]> {
    const where: Prisma.SpesaLiberaWhereInput = {};
    if (month) where.createdAt = getMonthRange(month);

    const raws = await this.prisma.spesaLibera.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return raws.map(this.mapToDomain);
  }

  async findAllPaged(month?: string, page = 1, limit = 20): Promise<IPaginatedResponse<SpesaLibera>> {
    const where: Prisma.SpesaLiberaWhereInput = {};
    if (month) where.createdAt = getMonthRange(month);

    const [raws, total] = await this.prisma.$transaction([
      this.prisma.spesaLibera.findMany({
        where,
        ...buildPagination(page, limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.spesaLibera.count({ where }),
    ]);

    return paginate(raws.map(this.mapToDomain), total, page, limit);
  }

  async create(spesa: SpesaLibera): Promise<SpesaLibera> {
    const data = spesa.toJSON();
    const created = await this.prisma.spesaLibera.create({
      data: {
        name: data.name,
        price: data.price,
      },
    });
    return this.mapToDomain(created);
  }

  async delete(id: number): Promise<boolean> {
    const existing = await this.prisma.spesaLibera.findUnique({ where: { id } });
    if (!existing) return false;
    await this.prisma.spesaLibera.delete({ where: { id } });
    return true;
  }
}
