import prisma from '../utils/prisma';
import { Attachment } from '@prisma/client';

export class AttachmentRepository {
  /**
   * Crea un nuovo attachment nel database
   */
  static async create(data: {
    id: string;
    bookingId: number;
    fileName: string;
    fileSize: number;
    mimeType: string;
    filePath: string;
  }): Promise<Attachment> {
    return prisma.attachment.create({
      data,
    });
  }

  /**
   * Recupera un attachment per ID
   */
  static async findById(id: string): Promise<Attachment | null> {
    return prisma.attachment.findUnique({
      where: { id },
    });
  }

  /**
   * Recupera tutti gli attachment per bookingId
   */
  static async findByBookingId(bookingId: number): Promise<Attachment[]> {
    return prisma.attachment.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Elimina un attachment dal database
   */
  static async delete(id: string): Promise<Attachment | null> {
    return prisma.attachment.delete({
      where: { id },
    }).catch(() => null);
  }

  /**
   * Verifica che un booking esiste e appartiene all'utente
   */
  static async bookingExists(bookingId: number): Promise<boolean> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true },
    });
    return !!booking;
  }

  /**
   * Conta gli attachment per bookingId
   */
  static async countByBookingId(bookingId: number): Promise<number> {
    return prisma.attachment.count({
      where: { bookingId },
    });
  }
}
