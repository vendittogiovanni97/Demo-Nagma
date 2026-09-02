import { Prisma, TransactionType } from '@prisma/client';

/**
 * Helper condivisi per la Transaction "specchio" generata dalle entità di dominio
 * (spesa/entrata libera, prenotazione). Centralizzano creazione e soft-delete così
 * la logica non è ripetuta nei singoli service.
 */

export interface MirrorTransactionInput {
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  sourceId: number;
  sourceType: string;
  date?: Date;
}

export function createMirrorTransaction(tx: Prisma.TransactionClient, input: MirrorTransactionInput) {
  return tx.transaction.create({
    data: {
      type: input.type,
      category: input.category,
      description: input.description,
      amount: input.amount,
      date: input.date ?? new Date(),
      sourceId: input.sourceId,
      sourceType: input.sourceType,
    },
  });
}

export function softDeleteMirrorTransactions(
  tx: Prisma.TransactionClient,
  sourceId: number,
  sourceType: string | string[],
) {
  return tx.transaction.updateMany({
    where: {
      sourceId,
      sourceType: Array.isArray(sourceType) ? { in: sourceType } : sourceType,
      deletedAt: null,
    },
    data: { deletedAt: new Date() },
  });
}
