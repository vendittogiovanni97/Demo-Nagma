import { z } from 'zod';

import { nonEmptyString, whatsappMessageStatusSchema } from './common';

export const createWhatsAppTemplateSchema = z.object({
  name: nonEmptyString('Il nome del template è obbligatorio'),
  category: z.string().trim().optional(),
  body: nonEmptyString('Il contenuto del template è obbligatorio'),
  isActive: z.boolean().optional(),
});

export const updateWhatsAppTemplateSchema = createWhatsAppTemplateSchema.partial();

export const sendWhatsAppMessageSchema = z.object({
  templateId: z.string().trim().optional(),
  bookingId: z.string().trim().optional(),
  customerId: z.string().trim().optional(),
  recipientName: z.string().trim().optional(),
  recipientPhone: nonEmptyString('Il numero di telefono è obbligatorio'),
  message: z.string().trim().optional(),
  variables: z.record(z.string(), z.string()).default({}),
});

export const listWhatsAppLogsSchema = z.object({
  search: z.string().trim().optional(),
  status: whatsappMessageStatusSchema.optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});
