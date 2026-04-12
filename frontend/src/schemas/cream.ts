import { z } from 'zod';

import { nonEmptyString } from './common';

export const createCreamSchema = z.object({
  name: nonEmptyString('Il nome è obbligatorio'),
  brand: z.string().optional(),
  price: z.number().positive('Il prezzo deve essere positivo'),
  stock: z.number().int().min(0).optional(),
});

export const updateCreamSchema = z.object({
  name: z.string().min(1).optional(),
  brand: z.string().optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
});

export const registerSaleSchema = z.object({
  creamId: nonEmptyString('creamId è obbligatorio'),
  sellerId: nonEmptyString('sellerId è obbligatorio'),
  customerId: z.string().optional(),
  quantity: z.number().int().positive('La quantità deve essere positiva'),
  totalPrice: z.number().positive('Il totale deve essere positivo'),
});
