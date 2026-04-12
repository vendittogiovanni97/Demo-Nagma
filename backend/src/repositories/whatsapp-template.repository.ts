import type { Prisma, WhatsAppMessageStatus } from '@prisma/client';

import prisma from '../utils/prisma';

export class WhatsAppTemplateRepository {
  async findAll(search?: string) {
    const where: Prisma.WhatsAppTemplateWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { category: { contains: search, mode: 'insensitive' } },
            { body: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    return prisma.whatsAppTemplate.findMany({
      where,
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findById(id: string) {
    return prisma.whatsAppTemplate.findUnique({ where: { id } });
  }

  async create(data: Prisma.WhatsAppTemplateCreateInput) {
    return prisma.whatsAppTemplate.create({ data });
  }

  async update(id: string, data: Prisma.WhatsAppTemplateUpdateInput) {
    return prisma.whatsAppTemplate.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.whatsAppTemplate.delete({ where: { id } });
  }

  async createLog(data: Prisma.WhatsAppMessageLogUncheckedCreateInput) {
    return prisma.whatsAppMessageLog.create({
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
      prisma.whatsAppMessageLog.findMany({
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
      prisma.whatsAppMessageLog.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }
}
