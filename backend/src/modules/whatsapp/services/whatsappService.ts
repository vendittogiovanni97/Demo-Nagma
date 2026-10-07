import { Prisma, WhatsAppMessageStatus } from '@prisma/client';
import prisma from '../../../core/shared/utils/prisma';
import { AppError } from '../../../core/shared/errors/AppError';
import { paginate, buildPagination } from '../../../core/shared/kernel/pagination';

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
    throw new AppError('Il numero di telefono non è valido', 400, 'WHATSAPP_PHONE_INVALID');
  }

  return normalized;
}

/**
 * Numero in formato internazionale senza "+" (quello richiesto da wa.me e dai JID).
 * I clienti inseriti senza prefisso sono numeri italiani: un cellulare "3xx…" va
 * completato con 39, altrimenti il messaggio finisce a un numero inesistente.
 */
export function toInternationalDigits(phone: string): string {
  const hasPlus = phone.trim().startsWith('+');
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  else if (!hasPlus && /^3\d{8,9}$/.test(digits)) digits = `39${digits}`;

  if (!digits) {
    throw new AppError('Il numero di telefono non è valido', 400, 'WHATSAPP_PHONE_INVALID');
  }
  return digits;
}

export interface PreparedWhatsAppMessage {
  templateId: number | null;
  templateName: string | null;
  recipientPhone: string;
  message: string;
  whatsappUrl: string;
}

type SendMessageInput = {
  recipientPhone?: string;
  phone?: string;
  customerId?: number;
  bookingId?: number;
  templateId?: number;
  message?: string;
  variables?: Record<string, string>;
  recipientName?: string;
};

export class WhatsAppService {
  async getAllTemplates(params: Record<string, unknown>) {
    const search = params.search as string | undefined;
    const startDate = params.startDate as string | undefined;
    const endDate = params.endDate as string | undefined;

    const where: Prisma.WhatsAppTemplateWhereInput = { deletedAt: null };

    if (startDate) where.createdAt = { gte: new Date(startDate) };
    if (endDate) where.createdAt = { ...where.createdAt as object, lte: new Date(endDate + 'T23:59:59.999Z') };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { body: { contains: search, mode: 'insensitive' } },
      ];
    }

    return prisma.whatsAppTemplate.findMany({
      where,
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async getLogs(params: Record<string, unknown>) {
    const search = params.search as string | undefined;
    const status = params.status as string | undefined;
    const page = params.page ? Number(params.page) : 1;
    const limit = params.limit ? Number(params.limit) : 25;

    const where: Prisma.WhatsAppMessageLogWhereInput = {
      ...(status ? { status: status as WhatsAppMessageStatus } : {}),
      ...(search
        ? {
            OR: [
              { recipientName: { contains: search, mode: 'insensitive' } },
              { recipientPhone: { contains: search, mode: 'insensitive' } },
              { templateName: { contains: search, mode: 'insensitive' } },
              { message: { contains: search, mode: 'insensitive' } },
              { customer: { firstName: { contains: search, mode: 'insensitive' } } },
              { customer: { lastName: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [raws, total] = await prisma.$transaction([
      prisma.whatsAppMessageLog.findMany({
        where,
        include: {
          template: true,
          customer: true,
          booking: true,
          createdBy: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        ...buildPagination(page, limit),
      }),
      prisma.whatsAppMessageLog.count({ where }),
    ]);

    return paginate(raws, total, page, limit);
  }

  async createTemplate(data: { name: string; category?: string | null; body: string; isActive?: boolean }) {
    const created = await prisma.whatsAppTemplate.create({
      data: {
        name: data.name,
        category: data.category || null,
        body: data.body,
        isActive: data.isActive ?? true,
      },
    });
    return created;
  }

  async updateTemplate(id: number, data: Prisma.WhatsAppTemplateUpdateInput) {
    const existing = await prisma.whatsAppTemplate.findUnique({ where: { id, deletedAt: null } });
    if (!existing) throw new AppError('Template non trovato', 404, 'WHATSAPP_TEMPLATE_NOT_FOUND');

    const updated = await prisma.whatsAppTemplate.update({
      where: { id },
      data,
    });
    return updated;
  }

  async deleteTemplate(id: number) {
    const existing = await prisma.whatsAppTemplate.findUnique({ where: { id, deletedAt: null } });
    if (!existing) throw new AppError('Template non trovato', 404, 'WHATSAPP_TEMPLATE_NOT_FOUND');

    await prisma.whatsAppTemplate.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async duplicateTemplate(id: number) {
    const existing = await prisma.whatsAppTemplate.findUnique({ where: { id, deletedAt: null } });
    if (!existing) throw new AppError('Template non trovato', 404, 'WHATSAPP_TEMPLATE_NOT_FOUND');

    const created = await prisma.whatsAppTemplate.create({
      data: {
        name: `${existing.name} (Copia)`,
        category: existing.category,
        body: existing.body,
        isActive: existing.isActive,
      },
    });
    return created;
  }

  async prepareMessage(data: SendMessageInput): Promise<PreparedWhatsAppMessage> {
    let templateBody = data.message || '';
    let templateName: string | null = null;

    if (data.templateId) {
      const template = await prisma.whatsAppTemplate.findUnique({ where: { id: data.templateId, deletedAt: null } });
      if (!template) {
        throw new AppError('Template WhatsApp non trovato', 404, 'WHATSAPP_TEMPLATE_NOT_FOUND');
      }

      if (!template.isActive) {
        throw new AppError('Il template selezionato non è attivo', 400, 'WHATSAPP_TEMPLATE_INACTIVE');
      }

      templateBody = data.message?.trim() || template.body;
      templateName = template.name;
    }

    if (!templateBody.trim()) {
      throw new AppError('Il messaggio da inviare è obbligatorio', 400, 'WHATSAPP_MESSAGE_REQUIRED');
    }

    const message = renderTemplate(templateBody, data.variables || {});
    const recipientPhone = normalizePhoneNumber(data.recipientPhone || data.phone || '');
    const whatsappUrl = `https://wa.me/${toInternationalDigits(recipientPhone)}?text=${encodeURIComponent(message)}`;

    return { templateId: data.templateId ?? null, templateName, recipientPhone, message, whatsappUrl };
  }

  async logMessage(
    prepared: PreparedWhatsAppMessage,
    data: Pick<SendMessageInput, 'customerId' | 'bookingId' | 'recipientName' | 'variables'>,
    userId: number,
    status: WhatsAppMessageStatus,
  ) {
    return prisma.whatsAppMessageLog.create({
      data: {
        templateId: prepared.templateId,
        bookingId: data.bookingId || null,
        customerId: data.customerId || null,
        createdById: userId,
        recipientName: data.recipientName || null,
        recipientPhone: prepared.recipientPhone,
        templateName: prepared.templateName,
        message: prepared.message,
        status,
        variablesJson: data.variables,
      },
      include: {
        template: true,
        customer: true,
        booking: true,
        createdBy: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  }

  async sendMessage(data: SendMessageInput, userId: number) {
    const prepared = await this.prepareMessage(data);
    const log = await this.logMessage(prepared, data, userId, 'MANUAL_SENT');
    return { log, whatsappUrl: prepared.whatsappUrl, message: prepared.message };
  }
}
