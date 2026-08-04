import { Prisma } from '@prisma/client';
import prisma from '../../../core/shared/utils/prisma';
import { AppError } from '../../../core/shared/errors/AppError';
import { paginate, buildPagination } from '../../../core/shared/kernel/pagination';
import { getMonthRange } from '../../../core/shared/utils/date-utils';
import { config } from '../../../core/config/env';
import { financeCache } from './finance.cache';

export class EntrataLiberaService {
  async findAll(month?: string, page: number = 1, limit?: number) {
    const defaultLimit = limit ?? config.defaultPageLimit;
    const where: Prisma.EntrataLiberaWhereInput = { deletedAt: null };
    if (month) where.createdAt = getMonthRange(month);

    const [raws, total] = await prisma.$transaction([
      prisma.entrataLibera.findMany({
        where,
        ...buildPagination(page, defaultLimit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.entrataLibera.count({ where }),
    ]);

    const data = raws.map((r) => ({ ...r, amount: Number(r.amount) }));
    return paginate(data, total, page, defaultLimit);
  }

  async create(data: { name: string; amount: number }) {
    financeCache.clear();

    const created = await prisma.entrataLibera.create({
      data: { name: data.name, amount: data.amount },
    });

    await prisma.transaction.create({
      data: {
        type: 'ENTRATA',
        category: 'Entrate Libere',
        description: `Entrata Libera: ${data.name}`,
        amount: data.amount,
        date: new Date(),
        sourceId: created.id,
        sourceType: 'ENTRATA_LIBERA',
      },
    });

    return { ...created, amount: Number(created.amount) };
  }

  async delete(id: number) {
    financeCache.clear();
    const existing = await prisma.entrataLibera.findUnique({ where: { id, deletedAt: null } });
    if (!existing) throw new AppError('Entrata non trovata', 404, 'NOT_FOUND');

    await prisma.entrataLibera.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await prisma.transaction.updateMany({
      where: { sourceId: id, sourceType: 'ENTRATA_LIBERA', deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }
}
