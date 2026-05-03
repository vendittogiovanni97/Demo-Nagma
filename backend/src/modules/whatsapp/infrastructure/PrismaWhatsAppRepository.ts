import { PrismaClient, Prisma } from '@prisma/client';
import { IWhatsAppRepository, WhatsAppTemplateTemplatesFilters, WhatsAppLogFilters } from '../contracts/IWhatsAppRepository';
import { WhatsAppTemplate } from '../domain/WhatsAppTemplate';
import { WhatsAppLog } from '../domain/WhatsAppLog';
import { IPaginatedResponse } from '../../../shared/kernel/interfaces';
import { paginate, buildPagination } from '../../../shared/kernel/pagination';
import prismaClient from '../../../shared/utils/prisma';

export class PrismaWhatsAppRepository implements IWhatsAppRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prismaClient;
  }

  private mapTemplateToDomain(raw: any): WhatsAppTemplate {
    return new WhatsAppTemplate({
      id: raw.id,
      name: raw.name,
      category: raw.category,
      body: raw.body,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  private mapLogToDomain(raw: any): WhatsAppLog {
    return new WhatsAppLog({
      id: raw.id,
      templateId: raw.templateId,
      bookingId: raw.bookingId,
      customerId: raw.customerId,
      createdById: raw.createdById,
      recipientName: raw.recipientName,
      recipientPhone: raw.recipientPhone,
      templateName: raw.templateName,
      message: raw.message,
      status: raw.status as any,
      variablesJson: raw.variablesJson,
      createdAt: raw.createdAt,
      template: raw.template,
      customer: raw.customer,
      booking: raw.booking,
      createdBy: raw.createdBy,
    });
  }

  // Templates
  async findTemplateById(id: number): Promise<WhatsAppTemplate | null> {
    const raw = await this.prisma.whatsAppTemplate.findUnique({ where: { id } });
    return raw ? this.mapTemplateToDomain(raw) : null;
  }

  async findAllTemplates(filters: WhatsAppTemplateTemplatesFilters): Promise<WhatsAppTemplate[]> {
    const { search, startDate, endDate } = filters;
    const where: Prisma.WhatsAppTemplateWhereInput = {};

    if (startDate) where.createdAt = { gte: new Date(startDate) };
    if (endDate) where.createdAt = { ...where.createdAt as object, lte: new Date(endDate + 'T23:59:59.999') };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { body: { contains: search, mode: 'insensitive' } },
      ];
    }

    const raws = await this.prisma.whatsAppTemplate.findMany({
      where,
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
    });

    return raws.map(this.mapTemplateToDomain);
  }

  async createTemplate(template: WhatsAppTemplate): Promise<WhatsAppTemplate> {
    const data = template.toJSON();
    const created = await this.prisma.whatsAppTemplate.create({
      data: {
        name: data.name,
        category: data.category || null,
        body: data.body,
        isActive: data.isActive,
      },
    });
    return this.mapTemplateToDomain(created);
  }

  async updateTemplate(id: number, data: Partial<WhatsAppTemplate>): Promise<WhatsAppTemplate> {
    const updated = await this.prisma.whatsAppTemplate.update({
      where: { id },
      data: data as any,
    });
    return this.mapTemplateToDomain(updated);
  }

  async deleteTemplate(id: number): Promise<void> {
    await this.prisma.whatsAppTemplate.delete({ where: { id } });
  }

  // Logs
  async createLog(log: WhatsAppLog): Promise<WhatsAppLog> {
    const data = log.toJSON();
    const created = await this.prisma.whatsAppMessageLog.create({
      data: {
        templateId: data.templateId || null,
        bookingId: data.bookingId || null,
        customerId: data.customerId || null,
        createdById: data.createdById,
        recipientName: data.recipientName || null,
        recipientPhone: data.recipientPhone,
        templateName: data.templateName || null,
        message: data.message,
        status: data.status as any,
        variablesJson: data.variablesJson,
      },
      include: {
        template: true,
        customer: true,
        booking: true,
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
    return this.mapLogToDomain(created);
  }

  async findAllLogsPaged(filters: WhatsAppLogFilters): Promise<IPaginatedResponse<WhatsAppLog>> {
    const { search, status, page = 1, limit = 20 } = filters;
    const where: Prisma.WhatsAppMessageLogWhereInput = {
      ...(status ? { status: status as any } : {}),
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

    const [raws, total] = await this.prisma.$transaction([
      this.prisma.whatsAppMessageLog.findMany({
        where,
        include: {
          template: true,
          customer: true,
          booking: true,
          createdBy: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        ...buildPagination(page, limit),
      }),
      this.prisma.whatsAppMessageLog.count({ where }),
    ]);

    return paginate(raws.map(this.mapLogToDomain), total, page, limit);
  }
}
