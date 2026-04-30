import { Prisma, SpesaLibera } from '@prisma/client';
import { getMonthRange, paginate, buildPagination as paginateOpts } from '../utils/date-utils';
import { mapSpesaLiberaDecimals } from '../utils/decimal-mapper';
import prisma from '../utils/prisma';
import { configService } from './config.service';

export class SpesaLiberaService {
  async findAll(month?: string): Promise<SpesaLibera[]> {
    const where: Prisma.SpesaLiberaWhereInput = {};
    if (month) {
      where.createdAt = getMonthRange(month);
    }
    return prisma.spesaLibera.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAll(month?: string, page = 1, limit = configService.getMaxPageLimitSync()) {
    const where: Prisma.SpesaLiberaWhereInput = {};
    if (month) {
      where.createdAt = getMonthRange(month);
    }

    const [data, total] = await prisma.$transaction([
      prisma.spesaLibera.findMany({
        where,
        ...paginateOpts(page, limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.spesaLibera.count({ where }),
    ]);

    const result = paginate(data, total, page, limit);
    return { ...result, data: result.data.map(mapSpesaLiberaDecimals) };
  }

  async create(data: Prisma.SpesaLiberaCreateInput) {
    const created = await prisma.spesaLibera.create({ data });
    return mapSpesaLiberaDecimals(created);
  }

  async delete(id: number) {
    const existing = await prisma.spesaLibera.findUnique({ where: { id } });
    if (!existing) return null;
    await prisma.spesaLibera.delete({ where: { id } });
    return true;
  }
}
