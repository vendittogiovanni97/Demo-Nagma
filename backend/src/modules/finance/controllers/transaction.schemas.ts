import { z } from 'zod';

import { nonEmptyString, transactionTypeSchema } from '../../../core/shared/utils/common.schemas';

export const createTransactionSchema = z.object({
  type: transactionTypeSchema,
  category: nonEmptyString('La categoria è obbligatoria'),
  description: nonEmptyString('La descrizione è obbligatoria'),
  amount: z.number().positive('L\'importo deve essere positivo'),
  date: z.string().optional(),
});

export const updateTransactionSchema = z.object({
  type: transactionTypeSchema.optional(),
  category: nonEmptyString('La categoria è obbligatoria').optional(),
  description: nonEmptyString('La descrizione è obbligatoria').optional(),
  amount: z.number().positive('L\'importo deve essere positivo').optional(),
  date: z.string().optional(),
}).passthrough();
