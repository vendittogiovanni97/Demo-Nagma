import prisma from '../utils/prisma';
import { CreamRepository } from '../repositories/cream.repository';
import { validate, CreateCreamSchema, UpdateCreamSchema, RegisterSaleSchema } from '../utils/validators';

const repo = new CreamRepository();

export class CreamService {
  async getCreams() {
    return repo.findAll();
  }

  async createCream(body: unknown) {
    const data = validate(CreateCreamSchema, body);
    return repo.createCream({
      name: data.name,
      brand: data.brand ?? null,
      price: data.price,
      stock: data.stock ?? 0,
    });
  }

  async updateCream(id: string, body: unknown) {
    const data = validate(UpdateCreamSchema, body);
    return repo.updateCream(id, data);
  }

  async deleteCream(id: string) {
    return repo.softDeleteCream(id);
  }

  async getSales(sellerId?: string, month?: string) {
    return repo.findSales(sellerId, month);
  }

  async registerSale(body: unknown) {
    const data = validate(RegisterSaleSchema, body);

    // Operazione atomica: decremento stock + creazione vendita + transazione INCOME
    return prisma.$transaction(async (tx) => {
      await tx.cream.update({
        where: { id: data.creamId },
        data: { stock: { decrement: data.quantity } },
      });

      const sale = await tx.creamSale.create({
        data: {
          cream: { connect: { id: data.creamId } },
          seller: { connect: { id: data.sellerId } },
          ...(data.customerId ? { customer: { connect: { id: data.customerId } } } : {}),
          quantity: data.quantity,
          totalPrice: data.totalPrice,
        },
      });

      await tx.transaction.create({
        data: {
          type: 'INCOME',
          category: 'Vendita Prodotti',
          description: `Vendita Aftercare: ${data.quantity} pz.`,
          amount: data.totalPrice,
          date: new Date(),
        },
      });

      return sale;
    });
  }

  async deleteSale(id: string) {
    return repo.softDeleteSale(id);
  }
}
