import { z } from 'zod';
import { nonEmptyString } from '../../../core/shared/utils/common.schemas';

export const createEntrataLiberaSchema = z.object({
  name:   nonEmptyString('Il nome è obbligatorio'),
  amount: z.number().min(0),
});
