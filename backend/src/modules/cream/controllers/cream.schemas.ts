import { z } from 'zod';

export const createCreamSchema = z.object({
  name: z.string().min(1, 'Nome obbligatorio'),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const createCreamSaleSchema = z.object({
  creamId: z.number(),
  artistId: z.number(),
  quantity: z.number().min(1),
});

export type CreateCreamInput = z.infer<typeof createCreamSchema>;
export type CreateCreamSaleInput = z.infer<typeof createCreamSaleSchema>;
