import { container } from '../../core/container';
import { AttachmentService } from './services/attachmentService';
import { AttachmentController } from './controllers/attachment.controller';

export function bootstrapAttachment(): void {
  const attachmentService = new AttachmentService();
  const attachmentController = new AttachmentController(attachmentService);
  container.register(AttachmentService, attachmentService);
  container.register(AttachmentController, attachmentController);
}
