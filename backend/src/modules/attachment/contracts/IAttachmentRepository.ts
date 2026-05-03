import { Attachment } from '../domain/Attachment';

export interface IAttachmentRepository {
  findById(id: string): Promise<Attachment | null>;
  findByBookingId(bookingId: number): Promise<Attachment[]>;
  save(attachment: Attachment): Promise<Attachment>;
  delete(id: string): Promise<void>;
}
