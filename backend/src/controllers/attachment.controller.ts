import { Router, Request, Response, NextFunction } from 'express';
import busboy from 'busboy';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AttachmentService } from '../services/attachment.service';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

/**
 * FIX #5 SECURITY: Unvalidated File Upload - RCE Risk Prevention
 * MIME type whitelist per contenuti sicuri
 * Aggiungere tipi supportati secondo necessità di business
 */
const ALLOWED_MIME_TYPES = new Set([
  // Images
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  // Documents (safe for preview)
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'text/plain',
  'text/csv',
]);

/**
 * FIX #5: Max file size = 10MB to prevent DOS attacks
 * Aggiungere in config se necessario per business logic
 */
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export class AttachmentController {
  /**
   * POST /api/attachments/upload?bookingId=123
   * Carica un file allegato a un booking
   * Usa multipart/form-data con body streaming
   */
  static async uploadAttachment(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const bookingIdParam = req.query.bookingId as string;

      if (!bookingIdParam) {
        throw new AppError('bookingId mancante in query string', 400, 'MISSING_BOOKING_ID');
      }

      let bookingId: number;
      try {
        bookingId = parseInt(bookingIdParam, 10);
        if (isNaN(bookingId)) {
          throw new Error('Invalid number');
        }
      } catch {
        throw new AppError('bookingId deve essere un numero intero', 400, 'INVALID_BOOKING_ID');
      }

      // Usa busboy per parsare multipart/form-data
      const bb = busboy({ headers: req.headers });

      const results: Array<{
        id: string;
        fileName: string;
        fileSize: number;
        mimeType: string;
        createdAt: Date;
      }> = [];

      let pendingUploads = 0;
      let closed = false;
      let errored: unknown = null;
      let responded = false;

      const tryFinish = () => {
        if (responded) return;
        if (!closed) return;
        if (pendingUploads > 0) return;
        responded = true;
        if (errored) {
          next(errored);
          return;
        }
        res.status(201).json({
          success: true,
          message: `${results.length} file caricato/i con successo`,
          data: results,
          requestId: req.requestId,
        });
      };

      bb.on('file', (fieldname: string, file, info: { filename: string; mimeType: string }) => {
        pendingUploads++;
        const chunks: Buffer[] = [];

        file.on('data', (data: Buffer) => {
          // FIX #5: Size check durante lo streaming per DOS prevention
          const totalSize = chunks.reduce((sum, buf) => sum + buf.length, 0) + data.length;
          if (totalSize > MAX_FILE_SIZE_BYTES) {
            file.destroy();
            errored = new AppError(`File troppo grande (max ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB)`, 413, 'FILE_TOO_LARGE');
            return;
          }
          chunks.push(data);
        });

        file.on('end', async () => {
          try {
            // FIX #5: MIME type validation (whitelist approach)
            if (!ALLOWED_MIME_TYPES.has(info.mimeType)) {
              throw new AppError(
                `Tipo di file non consentito: ${info.mimeType}. File types allowed: ${Array.from(ALLOWED_MIME_TYPES).join(', ')}`,
                400,
                'FILE_TYPE_NOT_ALLOWED'
              );
            }

            const buffer = Buffer.concat(chunks);

            const attachment = await AttachmentService.uploadAttachment(
              bookingId,
              info.filename,
              buffer,
              info.mimeType,
            );

            results.push({
              id: attachment.id,
              fileName: attachment.fileName,
              fileSize: attachment.fileSize,
              mimeType: attachment.mimeType,
              createdAt: attachment.createdAt,
            });
          } catch (error) {
            logger.errorWithStack('Errore durante l\'upload del file', error, {
              bookingId,
              filename: info.filename,
              mimeType: info.mimeType,
            });
            if (!errored) errored = error;
          } finally {
            pendingUploads--;
            tryFinish();
          }
        });

        file.on('error', (error: unknown) => {
          logger.errorWithStack('Errore durante la lettura del file streaming', error, {
            bookingId,
            filename: info.filename,
          });
          if (!errored) errored = error;
        });
      });

      bb.on('close', () => {
        closed = true;
        tryFinish();
      });

      bb.on('error', (error: unknown) => {
        logger.errorWithStack('Errore durante il parsing multipart', error, { bookingId });
        if (!responded) {
          responded = true;
          next(new AppError('Errore durante il parsing della richiesta', 400, 'MULTIPART_PARSE_ERROR'));
        }
      });

      req.pipe(bb);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/attachments/:attachmentId/download
   * Scarica un allegato
   */
  static async downloadAttachment(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { attachmentId } = req.params as { attachmentId: string };

      const attachment = await AttachmentService.getAttachment(attachmentId);
      if (!attachment) {
        throw new AppError('Allegato non trovato', 404, 'ATTACHMENT_NOT_FOUND');
      }

      const fileBuffer = await AttachmentService.getAttachmentFile(attachment);

      res.setHeader('Content-Type', attachment.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${attachment.fileName}"`);
      res.setHeader('Content-Length', fileBuffer.length);

      res.send(fileBuffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/attachments/:attachmentId/preview
   * Ottiene la preview di un allegato (SVG)
   */
  static async getAttachmentPreview(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { attachmentId } = req.params as { attachmentId: string };

      const preview = await AttachmentService.getAttachmentPreview(attachmentId);

      if (!preview) {
        // Ritorna una preview placeholder default
        const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <rect width="100" height="100" fill="#ccc"/>
          <text x="50" y="50" text-anchor="middle" dy=".3em" fill="#999" font-size="12">No Preview</text>
        </svg>`;

        res.setHeader('Content-Type', 'image/svg+xml');
        res.send(placeholderSvg);
        return;
      }

      res.setHeader('Content-Type', 'image/svg+xml');
      res.send(preview);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/attachments/booking/:bookingId
   * Recupera tutti gli allegati di un booking
   */
  static async getBookingAttachments(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { bookingId } = req.params as { bookingId: string };

      let parsedBookingId: number;
      try {
        parsedBookingId = parseInt(bookingId, 10);
        if (isNaN(parsedBookingId)) {
          throw new Error('Invalid number');
        }
      } catch {
        throw new AppError('bookingId deve essere un numero intero', 400, 'INVALID_BOOKING_ID');
      }

      const attachments = await AttachmentService.getAttachmentsByBookingId(parsedBookingId);

      const enrichedAttachments = await Promise.all(
        attachments.map(async (att) => ({
          id: att.id,
          fileName: att.fileName,
          fileSize: att.fileSize,
          mimeType: att.mimeType,
          createdAt: att.createdAt,
          updatedAt: att.updatedAt,
          preview: await AttachmentService.getAttachmentPreview(att.id),
        })),
      );

      res.status(200).json({
        success: true,
        data: enrichedAttachments,
        count: enrichedAttachments.length,
        requestId: req.requestId,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/attachments/:attachmentId
   * Elimina un allegato
   */
  static async deleteAttachment(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { attachmentId } = req.params as { attachmentId: string };

      await AttachmentService.deleteAttachment(attachmentId);

      res.status(200).json({
        success: true,
        message: 'Allegato eliminato con successo',
        requestId: req.requestId,
      });
    } catch (error) {
      next(error);
    }
  }
}
