import { Response, NextFunction } from 'express';
import busboy from 'busboy';
import { AuthRequest } from '../../../core/middleware/auth.middleware';
import { AttachmentService } from '../services/attachmentService';
import { AppError } from '../../../core/shared/errors/AppError';
import { parseId } from '../../../core/shared/utils/parse-id';
import { asyncHandler } from '../../../core/shared/utils/asyncHandler';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'text/csv',
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export class AttachmentController {
  constructor(private attachmentService: AttachmentService) {}

  // Upload multipart in streaming: gli errori di SETUP (bookingId mancante,
  // parseId) sono propagati da asyncHandler → next; gli errori di STREAM sono
  // gestiti dagli event handler di busboy (unico caso legittimo di try/catch
  // interno, non delegabile alla handler factory CRUD).
  upload = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const bookingIdParam = req.query.bookingId as string;
    if (!bookingIdParam) throw new AppError('bookingId mancante', 400, 'MISSING_BOOKING_ID');
    const bookingId = parseId(bookingIdParam);

    const bb = busboy({ headers: req.headers });
    const results: any[] = [];
    let pendingUploads = 0;
    let closed = false;
    let errored: any = null;
    let responded = false;

    const tryFinish = () => {
      if (responded || !closed || pendingUploads > 0) return;
      responded = true;
      if (errored) return next(errored);
      res.status(201).json({ success: true, data: results });
    };

    bb.on('file', (fieldname, file, info) => {
      pendingUploads++;
      const chunks: Buffer[] = [];

      file.on('data', (data) => {
        const totalSize = chunks.reduce((sum, buf) => sum + buf.length, 0) + data.length;
        if (totalSize > MAX_FILE_SIZE_BYTES) {
          file.destroy();
          errored = new AppError('File troppo grande', 413, 'FILE_TOO_LARGE');
        }
        chunks.push(data);
      });

      file.on('end', async () => {
        try {
          if (!ALLOWED_MIME_TYPES.has(info.mimeType)) {
            throw new AppError(`Tipo non consentito: ${info.mimeType}`, 400, 'FILE_TYPE_NOT_ALLOWED');
          }

          const attachment = await this.attachmentService.upload({
            bookingId,
            fileName: info.filename,
            buffer: Buffer.concat(chunks),
            mimeType: info.mimeType,
          });

          results.push(attachment);
        } catch (err) {
          if (!errored) errored = err;
        } finally {
          pendingUploads--;
          tryFinish();
        }
      });
    });

    bb.on('close', () => { closed = true; tryFinish(); });
    bb.on('error', (err) => { if (!responded) { responded = true; next(err); } });
    req.pipe(bb);
  });

  download = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { attachmentId } = req.params as { attachmentId: string };
    const { attachment, buffer } = await this.attachmentService.download(attachmentId);

    res.setHeader('Content-Type', attachment.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.fileName}"`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  });

  getPreview = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { attachmentId } = req.params as { attachmentId: string };
    const preview = await this.attachmentService.getPreview(attachmentId);

    if (!preview) {
      const placeholder = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#ccc"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="#999" font-size="12">No Preview</text></svg>`;
      res.setHeader('Content-Type', 'image/svg+xml');
      return res.send(placeholder);
    }

    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(preview);
  });

  getByBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
    const bookingId = parseId(req.params.bookingId);
    const attachments = await this.attachmentService.findByBooking(bookingId);

    const data = await Promise.all(attachments.map(async (att: any) => ({
      ...att,
      preview: await this.attachmentService.getPreview(att.id)
    })));

    res.json({ success: true, data });
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { attachmentId } = req.params as { attachmentId: string };
    await this.attachmentService.delete(attachmentId);
    res.status(204).send();
  });
}
