import type { Prisma, WhatsAppTemplate, WhatsAppMessageStatus } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { BaseRepository } from './BaseRepository';
import { paginate } from '../utils/date-utils';
import prisma from '../utils/prisma';

export class WhatsAppTemplateRepository extends BaseRepository<WhatsAppTemplate, Prisma.WhatsAppTemplateCreateInput, Prisma.WhatsAppTemplateUpdateInput> {
  constructor(prismaClient: PrismaClient = prisma) {
    super(prismaClient);
  }

  async create(data: Prisma.WhatsAppTemplateCreateInput): Promise<WhatsAppTemplate> {
    return this.prisma.whatsAppTemplate.create({ data });
  }

  async findById(id: string | number): Promise<WhatsAppTemplate | null> {
    const templateId = typeof id === 'number' ? id : parseInt(id, 10);
    return this.prisma.whatsAppTemplate.findUnique({ where: { id: templateId } });
  }

  async findAll(search?: string): Promise<WhatsAppTemplate[]> {
    return this.findAllWithSearch(search);
  }

  async update(id: string | number, data: Prisma.WhatsAppTemplateUpdateInput): Promise<WhatsAppTemplate> {
    const templateId = typeof id === 'number' ? id : parseInt(id, 10);
    return this.prisma.whatsAppTemplate.update({ where: { id: templateId }, data });
  }

  async delete(id: string | number): Promise<void> {
    const templateId = typeof id === 'number' ? id : parseInt(id, 10);
    await this.prisma.whatsAppTemplate.delete({ where: { id: templateId } });
  }

  // ============================================================================
  // SPECIALIZED METHODS - Custom business logic
  // ============================================================================

  async findAllWithSearch(search?: string) {
    const where: Prisma.WhatsAppTemplateWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { category: { contains: search, mode: 'insensitive' } },
            { body: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    return this.prisma.whatsAppTemplate.findMany({
      where,
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createLog(data: Prisma.WhatsAppMessageLogUncheckedCreateInput) {
    return this.prisma.whatsAppMessageLog.create({
      data,
      include: {
        template: true,
        customer: true,
        booking: true,
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  }

  async findLogs({
    search,
    status,
    page,
    limit,
  }: {
    search?: string;
    status?: WhatsAppMessageStatus;
    page: number;
    limit: number;
  }) {
    const where: Prisma.WhatsAppMessageLogWhereInput = {
      ...(status ? { status } : {}),
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

    const [data, total] = await Promise.all([
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
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.whatsAppMessageLog.count({ where }),
    ]);

    return paginate(data, total, page, limit);
  }
}
