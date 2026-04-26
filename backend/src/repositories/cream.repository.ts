import type { CreamTattoo, CreamSale } from '@prisma/client';
import prisma from '../utils/prisma';
import { config } from '../config/env';
import { configService } from '../services/config.service';

export class CreamRepository {
  async findActive(): Promise<CreamTattoo | null> {
    return prisma.creamTattoo.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number): Promise<CreamTattoo | null> {
    return prisma.creamTattoo.findUnique({ where: { id } });
  }

  async create(data: { name: string; description?: string | null; isActive?: boolean }): Promise<CreamTattoo> {
    return prisma.creamTattoo.create({ data });
  }

  async createSale(creamId: number, artistId: number, quantity: number): Promise<CreamSale> {
    return prisma.creamSale.create({
      data: { creamId, artistId, quantity },
    });
  }

  async getSalesByCream(creamId: number, page = 1, limit = configService.getMaxPageLimitSync(), filters?: { startDate?: string; endDate?: string; artistId?: number }) {
    const skip = (page - 1) * limit;
    const where: any = { creamId };

    if (filters?.startDate || filters?.endDate) {
      where.soldAt = {};
      if (filters.startDate) where.soldAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.soldAt.lte = new Date(filters.endDate + 'T23:59:59');
    }

    if (filters?.artistId) {
      where.artistId = filters.artistId;
    }

    const [data, total] = await prisma.$transaction([
      prisma.creamSale.findMany({
        where,
        take: limit,
        skip,
        orderBy: { soldAt: 'desc' },
        include: {
          artist: { select: { id: true, name: true, color: true } },
        },
      }),
      prisma.creamSale.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getSalesSummary() {
    return prisma.staff.findMany({
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
  }
}