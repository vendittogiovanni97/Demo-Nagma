import { IAttachmentRepository } from '../contracts/IAttachmentRepository';
import { FileSystemManager } from '../../../shared/utils/filesystem';
import { AppError } from '../../../shared/errors/AppError';

export class DeleteAttachment {
  constructor(private attachmentRepository: IAttachmentRepository) {}

  async execute(id: string): Promise<void> {
    const attachment = await this.attachmentRepository.findById(id);
    if (!attachment) {
      throw new AppError('Allegato non trovato', 404, 'ATTACHMENT_NOT_FOUND');
    }

    // Elimina il file dal filesystem
    await FileSystemManager.deleteFile(attachment.filePath).catch(() => null);

    // Elimina dal database
    await this.attachmentRepository.delete(id);
  }
}
