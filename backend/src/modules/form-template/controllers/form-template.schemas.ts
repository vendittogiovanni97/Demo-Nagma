import { z } from 'zod';

import { nonEmptyString } from '../../../core/shared/utils/common.schemas';

export const createFormTemplateSchema = z.object({
  name: nonEmptyString('Il nome del template è obbligatorio'),
  schemaB64: nonEmptyString('Lo schema Base64 è obbligatorio'),
});

export const updateFormTemplateSchema = createFormTemplateSchema.partial().refine(
  (data) => Object.keys(data).some(k => data[k as keyof typeof data] !== undefined),
  { message: 'Fornisci almeno un campo da aggiornare' }
);
