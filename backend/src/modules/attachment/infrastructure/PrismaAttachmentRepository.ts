import { PrismaClient, Prisma } from '@prisma/client';
import { IAttachmentRepository } from '../contracts/IAttachmentRepository';
import { Attachment } from '../domain/Attachment';
import prismaClient from '../../../shared/utils/prisma';

export class PrismaAttachmentRepository implements IAttachmentRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prismaClient;
  }

  private mapToDomain(raw: any): Attachment {
    return new Attachment({
      id: raw.id,
      bookingId: raw.bookingId,
      fileName: raw.fileName,
      fileSize: raw.fileSize,
      mimeType: raw.mimeType,
      filePath: raw.filePath,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async findById(id: string): Promise<Attachment | null> {
    const raw = await this.prisma.attachment.findUnique({ where: { id } });
    return raw ? this.mapToDomain(raw) : null;
  }

  async findByBookingId(bookingId: number): Promise<Attachment[]> {
    const raws = await this.prisma.attachment.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });
    return raws.map(this.mapToDomain);
  }

  async save(attachment: Attachment): Promise<Attachment> {
    const data = attachment.toJSON();
    const created = await this.prisma.attachment.create({
      data: {
        id: data.id,
        bookingId: data.bookingId,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        filePath: data.filePath,
      },
    });
    return this.mapToDomain(created);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.attachment.delete({ where: { id } });
  }
}
