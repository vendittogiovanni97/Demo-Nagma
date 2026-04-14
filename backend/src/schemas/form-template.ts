import { z } from 'zod';

import { nonEmptyString } from './common';

export const createFormTemplateSchema = z.object({
  name: nonEmptyString('Il nome del template è obbligatorio'),
  schemaB64: nonEmptyString('Lo schema Base64 è obbligatorio'),
});

export const updateFormTemplateSchema = z.object({
  name: z.string().optional(),
  schemaB64: z.string().optional(),
});
