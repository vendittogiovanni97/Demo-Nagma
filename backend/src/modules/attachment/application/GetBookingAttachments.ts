import { IAttachmentRepository } from '../contracts/IAttachmentRepository';
import { Attachment } from '../domain/Attachment';

export class GetBookingAttachments {
  constructor(private attachmentRepository: IAttachmentRepository) {}

  async execute(bookingId: number): Promise<Attachment[]> {
    return this.attachmentRepository.findByBookingId(bookingId);
  }
}
