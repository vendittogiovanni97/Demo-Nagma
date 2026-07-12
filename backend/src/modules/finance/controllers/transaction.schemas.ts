import { z } from 'zod';

import { nonEmptyString, transactionTypeSchema } from '../../../core/shared/utils/common.schemas';

export const createTransactionSchema = z.object({
  type: transactionTypeSchema,
  category: nonEmptyString('La categoria è obbligatoria'),
  description: nonEmptyString('La descrizione è obbligatoria'),
  amount: z.number().positive('L\'importo deve essere positivo'),
  date: z.string().optional(),
});
