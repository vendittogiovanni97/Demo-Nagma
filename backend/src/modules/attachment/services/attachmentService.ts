import { v4 as uuidv4 } from 'uuid';
import prisma from '../../../core/shared/utils/prisma';
import { AppError } from '../../../core/shared/errors/AppError';
import { FileSystemManager } from '../../../core/shared/utils/filesystem';
import { PreviewManager } from '../../../core/shared/utils/preview';

export class AttachmentService {
  async upload(data: { bookingId: number; fileName: string; buffer: Buffer; mimeType: string }) {
    const bookingExists = !!(await prisma.booking.findFirst({ where: { id: data.bookingId, deletedAt: null }, select: { id: true } }));
    if (!bookingExists) {
      throw new AppError('Booking non trovato', 404, 'BOOKING_NOT_FOUND');
    }

    const { filePath } = await FileSystemManager.saveFile(data.buffer, data.fileName);
    const attachmentId = uuidv4();
    await PreviewManager.generatePreview(filePath, data.mimeType, attachmentId);

    const created = await prisma.attachment.create({
      data: {
        id: attachmentId,
        bookingId: data.bookingId,
        fileName: data.fileName,
        fileSize: data.buffer.length,
        mimeType: data.mimeType,
        filePath,
      },
    });

    return created;
  }

  async download(id: string) {
    const attachment = await prisma.attachment.findFirst({ where: { id, deletedAt: null } });
    if (!attachment) {
      throw new AppError('Allegato non trovato', 404, 'ATTACHMENT_NOT_FOUND');
    }

    try {
      const buffer = await FileSystemManager.readFile(attachment.filePath);
      return { attachment, buffer };
    } catch (error) {
      throw new AppError('File non trovato nel server', 404, 'FILE_NOT_FOUND');
    }
  }

  async getPreview(id: string) {
    try {
      return await PreviewManager.getPreview(id);
    } catch (error) {
      return null;
    }
  }

  async findByBooking(bookingId: number) {
    const raws = await prisma.attachment.findMany({
      where: { bookingId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return raws;
  }

  async delete(id: string) {
    const attachment = await prisma.attachment.findFirst({ where: { id, deletedAt: null } });
    if (!attachment) {
      throw new AppError('Allegato non trovato', 404, 'ATTACHMENT_NOT_FOUND');
    }

    await FileSystemManager.deleteFile(attachment.filePath).catch(() => null);

    await prisma.attachment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
