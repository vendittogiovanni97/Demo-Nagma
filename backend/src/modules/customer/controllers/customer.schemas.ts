import { z } from 'zod';

export const createCustomerSchema = z.object({
  firstName: z.string().min(1, 'Nome obbligatorio'),
  lastName: z.string().min(1, 'Cognome obbligatorio'),
  phone: z.string().min(1, 'Telefono obbligatorio'),
  email: z.string().email('Email non valida').optional().or(z.literal('')),
  notes: z.string().optional(),
});

export const updateCustomerSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  email: z.string().email('Email non valida').optional().or(z.literal('')),
  notes: z.string().optional(),
});
