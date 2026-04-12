import {
  createBookingSchema,
  createCreamSchema,
  createCustomerSchema,
  createTransactionSchema,
  createUserSchema,
  createWhatsAppTemplateSchema,
  sendWhatsAppMessageSchema,
} from '@/schemas';
import type { CreateBookingData } from '@/types/booking';
import type { CreateCreamData } from '@/types/cream';
import type { CreateCustomerData } from '@/types/customer';
import type { CreateUserData, Role } from '@/types/team';
import type { CreateTransactionData } from '@/types/transaction';
import type { CreateWhatsAppTemplateData, SendWhatsAppMessageData } from '@/types/whatsapp';

function getFirstIssueMessage(result: { success: boolean; error?: { issues: { message: string }[] } }) {
  if (result.success) return null;
  return result.error?.issues[0]?.message || 'Dati non validi';
}

export function validateCustomerData(data: CreateCustomerData) {
  return getFirstIssueMessage(createCustomerSchema.safeParse(data));
}

export function validateBookingData(data: CreateBookingData & { time?: string }) {
  if (!data.customerId) return 'Seleziona un cliente';
  if (!data.artistId) return 'Seleziona un artista';
  if (!data.time) return 'L\'ora è obbligatoria';
  return getFirstIssueMessage(createBookingSchema.safeParse(data));
}

export function validateTransactionData(data: CreateTransactionData) {
  return getFirstIssueMessage(createTransactionSchema.safeParse(data));
}

export function validateCreamData(data: CreateCreamData) {
  return getFirstIssueMessage(createCreamSchema.safeParse(data));
}

export function validateStaffData(data: CreateUserData) {
  return getFirstIssueMessage(createUserSchema.safeParse(data));
}

export function validateWhatsAppTemplateData(data: CreateWhatsAppTemplateData) {
  return getFirstIssueMessage(createWhatsAppTemplateSchema.safeParse(data));
}

export function validateWhatsAppSendData(data: SendWhatsAppMessageData) {
  return getFirstIssueMessage(sendWhatsAppMessageSchema.safeParse(data));
}

export function parseRole(value: string): Role {
  if (value === 'ADMIN' || value === 'USER') return value;
  return 'ARTIST';
}
