import type { WhatsAppMessageStatus } from '@prisma/client';

import { WhatsAppTemplateRepository } from '../repositories/whatsapp-template.repository';
import { AppError } from '../utils/AppError';
import {
  createWhatsAppTemplateSchema,
  listWhatsAppLogsSchema,
  sendWhatsAppMessageSchema,
  updateWhatsAppTemplateSchema,
  validate,
} from '../schemas';

const repo = new WhatsAppTemplateRepository();

function extractTemplateVariables(templateBody: string) {
  return Array.from(templateBody.matchAll(/{{\s*([\w.-]+)\s*}}/g)).map((match) => match[1]);
}

function renderTemplate(body: string, variables: Record<string, string>) {
  const requiredVariables = extractTemplateVariables(body);
  const missingVariables = requiredVariables.filter((key) => !variables[key]?.trim());

  if (missingVariables.length > 0) {
    throw new AppError(
      `Compila prima queste variabili: ${missingVariables.join(', ')}`,
      400,
      'WHATSAPP_VARIABLES_MISSING',
      missingVariables
    );
  }

  return body.replace(/{{\s*([\w.-]+)\s*}}/g, (_match, key: string) => variables[key]?.trim() || '');
}

function normalizePhoneNumber(phone: string) {
  const normalized = phone.replace(/[^\d+]/g, '');

  if (!normalized) {
    throw new AppError('Il numero di telefono non e valido', 400, 'WHATSAPP_PHONE_INVALID');
  }

  return normalized;
}

export class WhatsAppTemplateService {
  async getAll(search?: string, startDate?: string, endDate?: string) {
    return repo.findAll(search, startDate, endDate);
  }

  async getLogs(query: unknown) {
    const rawQuery = (typeof query === 'object' && query ? query : {}) as Record<string, unknown>;

    const filters = validate(
      listWhatsAppLogsSchema,
      {
        ...rawQuery,
        page: rawQuery.page ? Number(rawQuery.page) : 1,
        limit: rawQuery.limit ? Number(rawQuery.limit) : 20,
      }
    );

    return repo.findLogs({
      search: filters.search,
      status: filters.status as WhatsAppMessageStatus | undefined,
      page: filters.page,
      limit: filters.limit,
    });
  }

  async create(body: unknown) {
    const data = validate(createWhatsAppTemplateSchema, body);

    return repo.create({
      name: data.name,
      category: data.category || null,
      body: data.body,
      isActive: data.isActive ?? true,
    });
  }

  async update(id: number, body: unknown) {
    const existing = await repo.findById(id);
    if (!existing) throw new AppError('Template non trovato', 404, 'WHATSAPP_TEMPLATE_NOT_FOUND');

    const data = validate(updateWhatsAppTemplateSchema, body);
    return repo.update(id, {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.category !== undefined ? { category: data.category || null } : {}),
      ...(data.body !== undefined ? { body: data.body } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    });
  }

  async delete(id: number) {
    const existing = await repo.findById(id);
    if (!existing) throw new AppError('Template non trovato', 404, 'WHATSAPP_TEMPLATE_NOT_FOUND');
    return repo.delete(id);
  }

  async duplicate(id: number) {
    const existing = await repo.findById(id);
    if (!existing) throw new AppError('Template non trovato', 404, 'WHATSAPP_TEMPLATE_NOT_FOUND');

    return repo.create({
      name: `${existing.name} (Copia)`,
      category: existing.category || null,
      body: existing.body,
      isActive: existing.isActive,
    });
  }

  async sendManualMessage(body: unknown, userId: number) {
    const data = validate(sendWhatsAppMessageSchema, body);
    let templateBody = data.message || '';
    let templateName: string | null = null;

    if (data.templateId) {
      const template = await repo.findById(data.templateId);
      if (!template) {
        throw new AppError('Template WhatsApp non trovato', 404, 'WHATSAPP_TEMPLATE_NOT_FOUND');
      }

      if (!template.isActive) {
        throw new AppError('Il template selezionato non e attivo', 400, 'WHATSAPP_TEMPLATE_INACTIVE');
      }

      templateBody = data.message?.trim() || template.body;
      templateName = template.name;
    }

    if (!templateBody.trim()) {
      throw new AppError('Il messaggio da inviare e obbligatorio', 400, 'WHATSAPP_MESSAGE_REQUIRED');
    }

    const renderedMessage = renderTemplate(templateBody, data.variables);
    const recipientPhone = normalizePhoneNumber(data.recipientPhone);
    const whatsappUrl = `https://wa.me/${recipientPhone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(renderedMessage)}`;

    const log = await repo.createLog({
      templateId: data.templateId || null,
      bookingId: data.bookingId || null,
      customerId: data.customerId || null,
      createdById: userId,
      recipientName: data.recipientName || null,
      recipientPhone,
      templateName,
      message: renderedMessage,
      status: 'MANUAL_SENT',
      variablesJson: data.variables,
    });

    return {
      log,
      whatsappUrl,
      message: renderedMessage,
    };
  }
}
