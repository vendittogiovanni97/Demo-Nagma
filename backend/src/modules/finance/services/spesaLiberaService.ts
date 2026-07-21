import { Prisma } from '@prisma/client';
import prisma from '../../../core/shared/utils/prisma';
import { AppError } from '../../../core/shared/errors/AppError';
import { paginate, buildPagination } from '../../../core/shared/kernel/pagination';
import { getMonthRange } from '../../../core/shared/utils/date-utils';
import { Cache } from '../../../core/shared/utils/cache';
import { config } from '../../../core/config/env';

const financeCache = new Cache(60 * 1000);

export class SpesaLiberaService {
  async findAll(month?: string, page: number = 1, limit?: number) {
    const defaultLimit = limit ?? config.defaultPageLimit;
    const where: Prisma.SpesaLiberaWhereInput = { deletedAt: null };
    if (month) where.createdAt = getMonthRange(month);

    const [raws, total] = await prisma.$transaction([
      prisma.spesaLibera.findMany({
        where,
        ...buildPagination(page, defaultLimit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.spesaLibera.count({ where }),
    ]);

    const data = raws.map((r) => ({ ...r, price: Number(r.price) }));
    return paginate(data, total, page, defaultLimit);
  }

  async create(data: { name: string; price: number }) {
    financeCache.clear();

    const created = await prisma.spesaLibera.create({
      data: { name: data.name, price: data.price },
    });

    await prisma.transaction.create({
      data: {
        type: 'USCITA',
        category: 'Spese Libere',
        description: `Spesa Libera: ${data.name}`,
        amount: data.price,
        date: new Date(),
        sourceId: created.id,
        sourceType: 'SPESA_LIBERA',
      },
    });

    return { ...created, price: Number(created.price) };
  }

  async delete(id: number) {
    financeCache.clear();
    const existing = await prisma.spesaLibera.findUnique({ where: { id, deletedAt: null } });
    if (!existing) throw new AppError('Spesa non trovata', 404, 'NOT_FOUND');

    await prisma.spesaLibera.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await prisma.transaction.updateMany({
      where: { sourceId: id, sourceType: 'SPESA_LIBERA', deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }
}
