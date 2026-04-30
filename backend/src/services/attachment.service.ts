import { AppError } from '../utils/AppError';
import { FileSystemManager } from '../utils/filesystem';
import { PreviewManager } from '../utils/preview';
import { Attachment } from '@prisma/client';
import prisma from '../utils/prisma';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export class AttachmentService {
  /**
   * Carica un allegato per un booking
   * @param bookingId - ID del booking
   * @param fileName - nome file originale
   * @param buffer - contenuto file
   * @param mimeType - tipo MIME
   */
  static async uploadAttachment(
    bookingId: number,
    fileName: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<Attachment> {
    try {
      // Verifica che il booking esista
      const bookingExists = !!(await prisma.booking.findUnique({ where: { id: bookingId }, select: { id: true } }));
      if (!bookingExists) {
        throw new AppError('Booking non trovato', 404, 'BOOKING_NOT_FOUND');
      }

      // Salva il file nel filesystem
      const { filePath } = await FileSystemManager.saveFile(buffer, fileName);

      // Genera preview
      const attachmentId = uuidv4();
      await PreviewManager.generatePreview(filePath, mimeType, attachmentId);

      // Salva nel database
      const attachment = await prisma.attachment.create({
        data: {
          id: attachmentId,
          bookingId,
          fileName,
          fileSize: buffer.length,
          mimeType,
          filePath,
        }
      });

      logger.info('Attachment caricato con successo', {
        attachmentId: attachment.id,
        bookingId,
        fileName,
        fileSize: buffer.length,
      });

      return attachment;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.errorWithStack('Errore upload attachment', error, {
        bookingId,
        fileName,
      });

      throw new AppError('Errore durante il caricamento dell\'allegato', 500, 'UPLOAD_FAILED');
    }
  }

  /**
   * Recupera un allegato per ID
   */
  static async getAttachment(attachmentId: string): Promise<Attachment | null> {
    try {
      return await prisma.attachment.findUnique({ where: { id: attachmentId } });
    } catch (error) {
      logger.errorWithStack('Errore recupero attachment', error, { attachmentId });
      throw new AppError('Errore durante il recupero dell\'allegato', 500, 'GET_FAILED');
    }
  }

  /**
   * Recupera il file di un allegato
   */
  static async getAttachmentFile(attachment: Attachment): Promise<Buffer> {
    try {
      return await FileSystemManager.readFile(attachment.filePath);
    } catch (error) {
      logger.errorWithStack('Errore lettura file attachment', error, {
        attachmentId: attachment.id,
        filePath: attachment.filePath,
      });
      throw new AppError('File non trovato', 404, 'FILE_NOT_FOUND');
    }
  }

  /**
   * Recupera tutti gli allegati per un booking
   */
  static async getAttachmentsByBookingId(bookingId: number): Promise<Attachment[]> {
    try {
      const bookingExists = !!(await prisma.booking.findUnique({ where: { id: bookingId }, select: { id: true } }));
      if (!bookingExists) {
        throw new AppError('Booking non trovato', 404, 'BOOKING_NOT_FOUND');
      }

      return await prisma.attachment.findMany({
        where: { bookingId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.errorWithStack('Errore recupero allegati', error, { bookingId });
      throw new AppError('Errore durante il recupero degli allegati', 500, 'GET_FAILED');
    }
  }

  /**
   * Recupera la preview di un allegato
   */
  static async getAttachmentPreview(attachmentId: string): Promise<string | null> {
    try {
      return await PreviewManager.getPreview(attachmentId);
    } catch (error) {
      logger.errorWithStack('Errore recupero preview', error, { attachmentId });
      return null;
    }
  }

  /**
   * Elimina un allegato
   */
  static async deleteAttachment(attachmentId: string): Promise<void> {
    try {
      const attachment = await prisma.attachment.findUnique({ where: { id: attachmentId } });
      if (!attachment) {
        throw new AppError('Allegato non trovato', 404, 'ATTACHMENT_NOT_FOUND');
      }

      // Elimina il file dal filesystem
      await FileSystemManager.deleteFile(attachment.filePath);

      // Elimina dal database
      await prisma.attachment.delete({ where: { id: attachmentId } }).catch(() => null);

      logger.info('Attachment eliminato con successo', { attachmentId });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.errorWithStack('Errore eliminazione attachment', error, { attachmentId });
      throw new AppError('Errore durante l\'eliminazione dell\'allegato', 500, 'DELETE_FAILED');
    }
  }
}
