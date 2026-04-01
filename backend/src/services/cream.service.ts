import { CreamRepository } from '../repositories/cream.repository';

export class CreamService {
  private repo = new CreamRepository();

  async getCreams() {
    return this.repo.findAll();
  }

  async createCream(data: any) {
    return this.repo.createCream({
      name: data.name,
      brand: data.brand || null,
      price: Number(data.price),
      stock: Number(data.stock || 0)
    });
  }

  async updateCream(id: string, data: any) {
    return this.repo.updateCream(id, data);
  }

  async deleteCream(id: string) {
    return this.repo.softDeleteCream(id);
  }

  async getSales(sellerId?: string, month?: string) {
    return this.repo.findSales(sellerId, month);
  }

  async registerSale(data: any) {
    if (!data.creamId || !data.sellerId || !data.quantity || !data.totalPrice) {
      throw new Error('Missing standard sale payload');
    }
    // Update stock implicitly
    await this.repo.updateCream(data.creamId, { stock: { decrement: Number(data.quantity) } });
    
    // Create Sale record
    const sale = await this.repo.createSale({
      cream: { connect: { id: data.creamId } },
      seller: { connect: { id: data.sellerId } },
      quantity: Number(data.quantity),
      totalPrice: Number(data.totalPrice)
    });

    // Create Transaction INCOME record
    const { TransactionService } = require('./transaction.service');
    const transactionService = new TransactionService();
    await transactionService.createTransaction({
      type: 'INCOME',
      category: 'Vendita Prodotti',
      description: `Vendita Aftercare: ${data.quantity} pz. - Venditore: ${data.sellerId}`,
      amount: Number(data.totalPrice),
      date: new Date().toISOString()
    });

    return sale;
  }

  async deleteSale(id: string) {
    return this.repo.softDeleteSale(id);
  }
}

