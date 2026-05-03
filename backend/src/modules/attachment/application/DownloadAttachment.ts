import { IAttachmentRepository } from '../contracts/IAttachmentRepository';
import { Attachment } from '../domain/Attachment';
import { FileSystemManager } from '../../../shared/utils/filesystem';
import { AppError } from '../../../shared/errors/AppError';

export class DownloadAttachment {
  constructor(private attachmentRepository: IAttachmentRepository) {}

  async execute(id: string): Promise<{ attachment: Attachment; buffer: Buffer }> {
    const attachment = await this.attachmentRepository.findById(id);
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
}
