import { z } from 'zod';
import { AppError } from './AppError';
import {
  createBookingSchema,
  createCustomerSchema,
  createFormTemplateSchema,
  createShiftSchema,
  createTransactionSchema,
  createUserSchema,
  createWhatsAppTemplateSchema,
  loginSchema,
  listWhatsAppLogsSchema,
  registerSchema,
  sendWhatsAppMessageSchema,
  updateBookingSchema,
  updateCustomerSchema,
  updateFormTemplateSchema,
  updateShiftSchema,
  updateWhatsAppTemplateSchema,
} from '../schemas';

// Valida il payload contro lo schema e lancia AppError(400) se non valido
export function validate<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    const message = details.map((issue) => issue.message).join(', ');
    throw new AppError(message, 400, 'VALIDATION_ERROR', details);
  }
  return result.data;
}

export const LoginSchema = loginSchema;
export const RegisterSchema = registerSchema;
export const CreateCustomerSchema = createCustomerSchema;
export const UpdateCustomerSchema = updateCustomerSchema;
export const CreateBookingSchema = createBookingSchema;
export const UpdateBookingSchema = updateBookingSchema;
export const CreateTransactionSchema = createTransactionSchema;
export const CreateFormTemplateSchema = createFormTemplateSchema;
export const UpdateFormTemplateSchema = updateFormTemplateSchema;
export const CreateUserSchema = createUserSchema;
export const CreateShiftSchema = createShiftSchema;
export const UpdateShiftSchema = updateShiftSchema;
export const CreateWhatsAppTemplateSchema = createWhatsAppTemplateSchema;
export const UpdateWhatsAppTemplateSchema = updateWhatsAppTemplateSchema;
export const SendWhatsAppMessageSchema = sendWhatsAppMessageSchema;
export const ListWhatsAppLogsSchema = listWhatsAppLogsSchema;
