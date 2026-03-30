import prisma from '../utils/prisma';
import { Prisma, TransactionType } from '@prisma/client';

export class TransactionRepository {
  async findAll(type?: TransactionType, monthStr?: string) {
    const whereClause: Prisma.TransactionWhereInput = { deletedAt: null };
    if (type) whereClause.type = type;

    // Filtro mese basico, es: '2026-03'
    if (monthStr) {
      const start = new Date(`${monthStr}-01T00:00:00.000Z`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      whereClause.date = { gte: start, lt: end };
    }

    return prisma.transaction.findMany({
      where: whereClause,
      orderBy: { date: 'desc' }
    });
  }

  async create(data: Prisma.TransactionCreateInput) {
    return prisma.transaction.create({ data });
  }

  async softDelete(id: string) {
    return prisma.transaction.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  async getSummary(monthStr?: string) {
    // Aggregation non supporta dove bene deletedAt: null su campi json senza un po' di magia
    // per questo caso lo facciamo a JS se i dati non sono troppi, o usiamo un groupBy
    const dove: Prisma.TransactionWhereInput = { deletedAt: null };
    if (monthStr) {
      const start = new Date(`${monthStr}-01T00:00:00.000Z`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      dove.date = { gte: start, lt: end };
    }

    const res = await prisma.transaction.groupBy({
      by: ['type'],
      where: dove,
      _sum: {
        amount: true
      }
    });
    return res;
  }
}
