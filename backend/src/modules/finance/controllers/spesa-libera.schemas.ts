import { z } from 'zod';
import { nonEmptyString } from '../../../core/shared/utils/common.schemas';

export const createSpesaLiberaSchema = z.object({
  name:  nonEmptyString('Il nome è obbligatorio'),
  price: z.number().min(0),
});
