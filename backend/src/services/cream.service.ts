import { CreamRepository } from '../repositories/cream.repository';
import { AppError } from '../utils/AppError';
import { validate, createCreamSchema } from '../schemas';

const repository = new CreamRepository();

export class CreamService {
  async getActive() {
    const cream = await repository.findActive();
    if (!cream) {
      throw new AppError('Nessuna crema attiva', 404);
    }
    return cream;
  }

  async createCream(body: unknown) {
    const data = validate(createCreamSchema, body);
    return repository.create({
      name: data.name,
      description: data.description ?? null,
      isActive: data.isActive ?? true,
    });
  }

  async createSale(creamId: number, artistId: number, quantity: number) {
    const cream = await repository.findById(creamId);
    if (!cream) {
      throw new AppError('Crema non trovata', 404);
    }
    return repository.createSale(creamId, artistId, quantity);
  }

  async getSalesByCream(creamId: number, page: number, limit: number, filters?: { startDate?: string; endDate?: string; artistId?: number }) {
    return repository.getSalesByCream(creamId, page, limit, filters);
  }

  async getSalesSummary() {
    const staff = await repository.getSalesSummary();
    return staff.map((s) => ({
      id: s.id,
      name: s.name,
      color: s.color,
      totalSales: s._count.creamSales,
      totalQuantity: s.creamSales.reduce((acc: number, sale: { quantity: number }) => acc + sale.quantity, 0),
    }));
  }
}