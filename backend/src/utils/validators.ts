import { z } from 'zod';
import { AppError } from './AppError';

// Valida il payload contro lo schema e lancia AppError(400) se non valido
export function validate<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues.map(i => i.message).join(', ');
    throw new AppError(message, 400);
  }
  return result.data;
}

// ── Schemas ──────────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(6, 'La password deve avere almeno 6 caratteri'),
});

export const RegisterSchema = z.object({
  name: z.string().min(1, 'Il nome è obbligatorio'),
  email: z.string().email('Email non valida'),
  password: z.string().min(6, 'La password deve avere almeno 6 caratteri'),
  role: z.enum(['ADMIN', 'USER', 'ARTIST']).optional(),
});

export const CreateCustomerSchema = z.object({
  firstName: z.string().min(1, 'Il nome è obbligatorio'),
  lastName: z.string().min(1, 'Il cognome è obbligatorio'),
  phone: z.string().min(1, 'Il telefono è obbligatorio'),
  email: z.string().email('Email non valida').optional().or(z.literal('')),
  notes: z.string().optional(),
});

export const CreateBookingSchema = z.object({
  customerId: z.string().min(1, 'customerId è obbligatorio'),
  artistId: z.string().min(1, 'artistId è obbligatorio'),
  date: z.string().min(1, 'La data è obbligatoria'),
  duration: z.number().int().positive().optional(),
  type: z.string().optional(),
  price: z.number().positive().optional(),
  deposit: z.number().positive().optional(),
  notes: z.string().optional(),
});

export const UpdateBookingSchema = z.object({
  status: z.enum(['CONFIRMED', 'CANCELLED', 'RESCHEDULED', 'COMPLETED']).optional(),
  date: z.string().optional(),
  duration: z.number().int().positive().optional(),
  type: z.string().optional(),
  price: z.number().positive().optional(),
  deposit: z.number().positive().optional(),
  notes: z.string().optional(),
});

export const CreateTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE'], { error: 'Il tipo deve essere INCOME o EXPENSE' }),
  category: z.string().min(1, 'La categoria è obbligatoria'),
  description: z.string().min(1, 'La descrizione è obbligatoria'),
  amount: z.number().positive('L\'importo deve essere positivo'),
  date: z.string().optional(),
});

export const CreateCreamSchema = z.object({
  name: z.string().min(1, 'Il nome è obbligatorio'),
  brand: z.string().optional(),
  price: z.number().positive('Il prezzo deve essere positivo'),
  stock: z.number().int().min(0).optional(),
});

export const UpdateCreamSchema = z.object({
  name: z.string().min(1).optional(),
  brand: z.string().optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
});

export const RegisterSaleSchema = z.object({
  creamId: z.string().min(1, 'creamId è obbligatorio'),
  sellerId: z.string().min(1, 'sellerId è obbligatorio'),
  customerId: z.string().optional(),
  quantity: z.number().int().positive('La quantità deve essere positiva'),
  totalPrice: z.number().positive('Il totale deve essere positivo'),
});

export const CreateUserSchema = z.object({
  name: z.string().min(1, 'Il nome è obbligatorio'),
  email: z.string().email('Email non valida'),
  password: z.string().min(6, 'La password deve avere almeno 6 caratteri'),
  role: z.enum(['ADMIN', 'USER', 'ARTIST']),
  phone: z.string().optional(),
  color: z.string().optional(),
});

export const CreateShiftSchema = z.object({
  userId: z.string().min(1, 'userId è obbligatorio'),
  weekStart: z.string().min(1, 'weekStart è obbligatorio'),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  isOff: z.boolean().optional(),
  notes: z.string().optional(),
});
