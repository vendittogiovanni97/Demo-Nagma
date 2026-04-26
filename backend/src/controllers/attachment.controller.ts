import { Router, Request, Response, NextFunction } from 'express';
import busboy from 'busboy';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AttachmentService } from '../services/attachment.service';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

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

      let uploadCount = 0;
      const results: Array<{
        id: string;
        fileName: string;
        fileSize: number;
        mimeType: string;
        createdAt: Date;
      }> = [];

      bb.on('file', async (fieldname: string, file, info: { filename: string; mimeType: string }) => {
        try {
          const chunks: Buffer[] = [];

          file.on('data', (data: Buffer) => {
            chunks.push(data);
          });

          file.on('end', async () => {
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

            uploadCount++;
          });

          file.on('error', (error: unknown) => {
            logger.errorWithStack('Errore durante la lettura del file streaming', error, {
              bookingId,
              filename: info.filename,
            });
          });
        } catch (error) {
          logger.errorWithStack('Errore durante l\'upload del file', error, {
            bookingId,
            filename: info.filename,
          });
        }
      });

      bb.on('close', () => {
        res.status(200).json({
          success: true,
          message: `${uploadCount} file caricato/i con successo`,
          data: results,
          requestId: req.requestId,
        });
      });

      bb.on('error', (error: unknown) => {
        logger.errorWithStack('Errore durante il parsing multipart', error, { bookingId });
        next(new AppError('Errore durante il parsing della richiesta', 400, 'MULTIPART_PARSE_ERROR'));
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
