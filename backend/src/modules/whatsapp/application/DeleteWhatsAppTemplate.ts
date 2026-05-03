import { IWhatsAppRepository } from '../contracts/IWhatsAppRepository';
import { AppError } from '../../../shared/errors/AppError';

export class DeleteWhatsAppTemplate {
  constructor(private whatsappRepository: IWhatsAppRepository) {}

  async execute(id: number): Promise<void> {
    const existing = await this.whatsappRepository.findTemplateById(id);
    if (!existing) throw new AppError('Template non trovato', 404, 'WHATSAPP_TEMPLATE_NOT_FOUND');
    
    await this.whatsappRepository.deleteTemplate(id);
  }
}
