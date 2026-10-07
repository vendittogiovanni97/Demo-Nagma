import { z } from 'zod';

export const roleSchema = z.enum(['SUPER_ADMIN', 'ADMIN']);
export const bookingStatusSchema = z.enum(['CREATO', 'CONFERMATO', 'COMPLETATO', 'MODIFICATO', 'SPOSTATO', 'ANNULLATO', 'CANCELLATO']);
export const transactionTypeSchema = z.enum(['ENTRATA', 'USCITA']);
export const whatsappMessageStatusSchema = z.enum(['MANUAL_SENT', 'AUTO_SENT', 'FAILED']);

export const nonEmptyString = (message: string) => z.string().trim().min(1, message);
export const optionalEmailSchema = z.string().email('Email non valida').optional().or(z.literal(''));
