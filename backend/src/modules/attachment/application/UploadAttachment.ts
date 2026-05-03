import { IAttachmentRepository } from '../contracts/IAttachmentRepository';
import { UploadAttachmentDTO } from '../contracts/AttachmentDTOs';
import { Attachment } from '../domain/Attachment';
import { FileSystemManager } from '../../../shared/utils/filesystem';
import { PreviewManager } from '../../../shared/utils/preview';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../../../shared/errors/AppError';
import prisma from '../../../shared/utils/prisma';

export class UploadAttachment {
  constructor(private attachmentRepository: IAttachmentRepository) {}

  async execute(data: UploadAttachmentDTO): Promise<Attachment> {
    // Verifica che il booking esista (usando prisma direttamente o un repo)
    const bookingExists = !!(await prisma.booking.findUnique({ where: { id: data.bookingId }, select: { id: true } }));
    if (!bookingExists) {
      throw new AppError('Booking non trovato', 404, 'BOOKING_NOT_FOUND');
    }

    // Salva il file nel filesystem
    const { filePath } = await FileSystemManager.saveFile(data.buffer, data.fileName);

    // Genera preview
    const attachmentId = uuidv4();
    await PreviewManager.generatePreview(filePath, data.mimeType, attachmentId);

    // Salva nel database
    const attachment = new Attachment({
      id: attachmentId,
      bookingId: data.bookingId,
      fileName: data.fileName,
      fileSize: data.buffer.length,
      mimeType: data.mimeType,
      filePath,
    });

    return this.attachmentRepository.save(attachment);
  }
}
