import { AppError } from '../utils/AppError';
import { validate, createCreamSchema } from '../schemas';
import prisma from '../utils/prisma';
import { configService } from './config.service';

export class CreamService {
  async getActive() {
    const cream = await prisma.creamTattoo.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    if (!cream) {
      throw new AppError('Nessuna crema attiva', 404);
    }
    return cream;
  }

  async createCream(body: unknown) {
    const data = validate(createCreamSchema, body);
    return prisma.creamTattoo.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        isActive: data.isActive ?? true,
      }
    });
  }

  async createSale(creamId: number, artistId: number, quantity: number) {
    const cream = await prisma.creamTattoo.findUnique({ where: { id: creamId } });
    if (!cream) {
      throw new AppError('Crema non trovata', 404);
    }
    return prisma.creamSale.create({
      data: { creamId, artistId, quantity },
    });
  }

  async getSalesByCream(creamId: number, page: number, limit: number, filters?: { startDate?: string; endDate?: string; artistId?: number }) {
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