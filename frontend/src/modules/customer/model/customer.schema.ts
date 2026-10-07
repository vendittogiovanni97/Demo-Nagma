import { z } from 'zod';

import { nonEmptyString, optionalEmailSchema } from '@/common/shared/schemas/common';

export const createCustomerSchema = z.object({
  firstName: nonEmptyString('Il nome è obbligatorio'),
  lastName: nonEmptyString('Il cognome è obbligatorio'),
  phone: nonEmptyString('Il telefono è obbligatorio'),
  email: optionalEmailSchema,
  birthDate: z.string().optional().nullable().or(z.literal('')),
  notes: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();
