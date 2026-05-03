import { PreviewManager } from '../../../shared/utils/preview';

export class GetAttachmentPreview {
  async execute(id: string): Promise<string | null> {
    try {
      return await PreviewManager.getPreview(id);
    } catch (error) {
      return null;
    }
  }
}
