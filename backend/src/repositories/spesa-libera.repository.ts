import { Prisma, SpesaLibera } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { getMonthRange, paginate } from '../utils/date-utils';
import prisma from '../utils/prisma';
import { config } from '../config/env';
import { configService } from '../services/config.service';

export class SpesaLiberaRepository {
  protected prisma: PrismaClient;

  constructor(prismaClient: PrismaClient = prisma) {
    this.prisma = prismaClient;
  }

  private buildPagination(page: number, limit: number) {
    return { skip: (page - 1) * limit, take: limit };
  }

  async findAll(month?: string): Promise<SpesaLibera[]> {
    const where: Prisma.SpesaLiberaWhereInput = {};
    if (month) {
      where.createdAt = getMonthRange(month);
    }
    return this.prisma.spesaLibera.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllPaged(month?: string, page = 1, limit = configService.getMaxPageLimitSync()) {
    const where: Prisma.SpesaLiberaWhereInput = {};
    if (month) {
      where.createdAt = getMonthRange(month);
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.spesaLibera.findMany({
        where,
        ...this.buildPagination(page, limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.spesaLibera.count({ where }),
    ]);

    return paginate(data, total, page, limit);
  }

  async create(data: Prisma.SpesaLiberaCreateInput): Promise<SpesaLibera> {
    return this.prisma.spesaLibera.create({ data });
  }

  async findById(id: number): Promise<SpesaLibera | null> {
    return this.prisma.spesaLibera.findUnique({ where: { id } });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.spesaLibera.delete({ where: { id } });
  }
}
