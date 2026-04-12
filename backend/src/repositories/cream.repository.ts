import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

export class CreamRepository {
  async findAllPaged({
    search,
    stockStatus,
    page = 1,
    limit = 12,
  }: {
    search?: string;
    stockStatus?: string;
    page?: number;
    limit?: number;
  }) {
    const where: Prisma.CreamWhereInput = { deletedAt: null };

    if (search?.trim()) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (stockStatus === 'LOW') where.stock = { gt: 0, lt: 5 };
    if (stockStatus === 'OUT') where.stock = { lte: 0 };

    const skip = (page - 1) * limit;
    const [data, total] = await prisma.$transaction([
      prisma.cream.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ stock: 'asc' }, { name: 'asc' }],
      }),
      prisma.cream.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findSales(sellerId?: string, monthStr?: string) {
    const where: Prisma.CreamSaleWhereInput = { deletedAt: null };
    if (sellerId) where.sellerId = sellerId;
    if (monthStr) {
      const start = new Date(`${monthStr}-01T00:00:00.000Z`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      where.createdAt = { gte: start, lt: end };
    }
    return prisma.creamSale.findMany({
      where,
      include: {
        cream: true,
        seller: { omit: { password: true } },
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createCream(data: Prisma.CreamCreateInput) {
    return prisma.cream.create({ data });
  }

  async updateCream(id: string, data: Prisma.CreamUpdateInput) {
    return prisma.cream.update({ where: { id }, data });
  }

  async softDeleteCream(id: string) {
    return prisma.cream.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  async createSale(data: Prisma.CreamSaleCreateInput) {
    return prisma.creamSale.create({ data });
  }

  async softDeleteSale(id: string) {
    return prisma.creamSale.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}
