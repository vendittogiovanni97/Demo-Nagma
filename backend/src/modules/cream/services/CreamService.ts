import { CreamSale, Prisma } from '@prisma/client';
import prisma from '../../../core/shared/utils/prisma';
import type { CreateCreamInput, CreateCreamSaleInput } from '../controllers/cream.schemas';
import { IPaginatedResponse } from '../../../core/shared/kernel/interfaces';
import { paginate, buildPagination } from '../../../core/shared/kernel/pagination';
import { AppError } from '../../../core/shared/errors/AppError';

export class CreamService {
  async findActive() {
    return prisma.creamTattoo.findFirst({
      where: { isActive: true, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number) {
    return prisma.creamTattoo.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async create(data: CreateCreamInput) {
    if (data.isActive) {
      await prisma.creamTattoo.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }
    return prisma.creamTattoo.create({
      data: {
        name: data.name,
        description: data.description || null,
        isActive: data.isActive,
      },
    });
  }

  async createSale(data: CreateCreamSaleInput) {
    return prisma.creamSale.create({
      data: {
        creamId: data.creamId,
        artistId: data.artistId,
        quantity: data.quantity,
      },
      include: {
        artist: { select: { id: true, name: true, color: true } },
      }
    });
  }

  async deleteSale(id: number) {
    const result = await prisma.creamSale.updateMany({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    if (result.count === 0) {
      throw new AppError('Vendita crema non trovata.', 404, 'CREAM_SALE_NOT_FOUND');
    }
  }

  async findSalesByCreamPaged(
    creamId: number,
    page: number,
    limit: number,
    filters?: { startDate?: string; endDate?: string; artistId?: number }
  ): Promise<IPaginatedResponse<CreamSale & { artist: { id: number; name: string; color: string } }> & { totalQuantity: number }> {
    const where: Prisma.CreamSaleWhereInput = { creamId, deletedAt: null };

    if (filters?.startDate || filters?.endDate) {
      where.soldAt = {};
      if (filters.startDate) where.soldAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.soldAt.lte = new Date(filters.endDate + 'T23:59:59');
    }

    if (filters?.artistId) {
      where.artistId = filters.artistId;
    }

    const [raws, total, agg] = await prisma.$transaction([
      prisma.creamSale.findMany({
        where,
        ...buildPagination(page, limit),
        orderBy: { soldAt: 'desc' },
        include: {
          artist: { select: { id: true, name: true, color: true } },
        },
      }),
      prisma.creamSale.count({ where }),
      prisma.creamSale.aggregate({ where, _sum: { quantity: true } }),
    ]);

    return { ...paginate(raws, total, page, limit), totalQuantity: agg._sum.quantity ?? 0 };
  }

  async getSalesSummary() {
    const staff = await prisma.staff.findMany({
      where: {
        creamSales: { some: {} },
      },
      select: {
        id: true,
        name: true,
        color: true,
        type: true,
        _count: { select: { creamSales: true } },
        creamSales: { select: { quantity: true } },
      },
    });

    return staff.map((s) => ({
      id: s.id,
      name: s.name,
      color: s.color,
      totalSales: s._count.creamSales,
      totalQuantity: s.creamSales.reduce((acc: number, sale: { quantity: number }) => acc + sale.quantity, 0),
    }));
  }
}
