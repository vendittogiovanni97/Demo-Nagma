import { Prisma, SpesaLibera } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { getMonthRange } from '../utils/date-utils';
import prisma from '../utils/prisma';

export class SpesaLiberaRepository {
  protected prisma: PrismaClient;

  constructor(prismaClient: PrismaClient = prisma) {
    this.prisma = prismaClient;
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
