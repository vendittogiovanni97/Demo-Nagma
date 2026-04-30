import { z } from 'zod';

export const roleSchema = z.enum(['SUPER_ADMIN', 'ADMIN']);
export const bookingStatusSchema = z.enum(['CONFERMATO', 'ANNULLATO', 'SPOSTATO', 'COMPLETATO']);
export const transactionTypeSchema = z.enum(['INCOME', 'EXPENSE']);
export const whatsappMessageStatusSchema = z.enum(['MANUAL_SENT', 'FAILED']);

export const nonEmptyString = (message: string) => z.string().trim().min(1, message);
export const optionalEmailSchema = z.string().email('Email non valida').optional().or(z.literal(''));
