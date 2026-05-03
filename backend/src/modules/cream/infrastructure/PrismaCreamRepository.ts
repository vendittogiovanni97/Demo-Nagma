import { PrismaClient, Prisma } from '@prisma/client';
import { ICreamRepository, CreamSaleFilters } from '../contracts/ICreamRepository';
import { Cream } from '../domain/Cream';
import { CreamSale } from '../domain/CreamSale';
import { IPaginatedResponse } from '../../../shared/kernel/interfaces';
import { paginate, buildPagination } from '../../../shared/kernel/pagination';
import prismaClient from '../../../shared/utils/prisma';

export class PrismaCreamRepository implements ICreamRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prismaClient;
  }

  private mapCreamToDomain(raw: any): Cream {
    return new Cream({
      id: raw.id,
      name: raw.name,
      description: raw.description,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  private mapSaleToDomain(raw: any): CreamSale {
    return new CreamSale({
      id: raw.id,
      creamId: raw.creamId,
      artistId: raw.artistId,
      quantity: raw.quantity,
      soldAt: raw.soldAt,
      artist: raw.artist,
    });
  }

  // Cream
  async findActive(): Promise<Cream | null> {
    const raw = await this.prisma.creamTattoo.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return raw ? this.mapCreamToDomain(raw) : null;
  }

  async findById(id: number): Promise<Cream | null> {
    const raw = await this.prisma.creamTattoo.findUnique({ where: { id } });
    return raw ? this.mapCreamToDomain(raw) : null;
  }

  async create(cream: Cream): Promise<Cream> {
    const data = cream.toJSON();
    const created = await this.prisma.creamTattoo.create({
      data: {
        name: data.name,
        description: data.description || null,
        isActive: data.isActive,
      },
    });
    return this.mapCreamToDomain(created);
  }

  // Sales
  async createSale(sale: CreamSale): Promise<CreamSale> {
    const data = sale.toJSON();
    const created = await this.prisma.creamSale.create({
      data: {
        creamId: data.creamId,
        artistId: data.artistId,
        quantity: data.quantity,
      },
    });
    return this.mapSaleToDomain(created);
  }

  async findSalesByCreamPaged(creamId: number, page: number, limit: number, filters?: CreamSaleFilters): Promise<IPaginatedResponse<CreamSale>> {
    const where: Prisma.CreamSaleWhereInput = { creamId };

    if (filters?.startDate || filters?.endDate) {
      where.soldAt = {};
      if (filters.startDate) where.soldAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.soldAt.lte = new Date(filters.endDate + 'T23:59:59');
    }

    if (filters?.artistId) {
      where.artistId = filters.artistId;
    }

    const [raws, total] = await this.prisma.$transaction([
      this.prisma.creamSale.findMany({
        where,
        ...buildPagination(page, limit),
        orderBy: { soldAt: 'desc' },
        include: {
          artist: { select: { id: true, name: true, color: true } },
        },
      }),
      this.prisma.creamSale.count({ where }),
    ]);

    return paginate(raws.map(this.mapSaleToDomain), total, page, limit);
  }

  async getSalesSummary(): Promise<any[]> {
    const staff = await this.prisma.staff.findMany({
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
