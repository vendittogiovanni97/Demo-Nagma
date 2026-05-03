import { IWhatsAppRepository } from '../contracts/IWhatsAppRepository';
import { WhatsAppTemplate } from '../domain/WhatsAppTemplate';
import { AppError } from '../../../shared/errors/AppError';

export class DuplicateWhatsAppTemplate {
  constructor(private whatsappRepository: IWhatsAppRepository) {}

  async execute(id: number): Promise<WhatsAppTemplate> {
    const existing = await this.whatsappRepository.findTemplateById(id);
    if (!existing) throw new AppError('Template non trovato', 404, 'WHATSAPP_TEMPLATE_NOT_FOUND');

    const duplicate = new WhatsAppTemplate({
      name: `${existing.name} (Copia)`,
      category: existing.category,
      body: existing.body,
      isActive: existing.isActive,
    });

    return this.whatsappRepository.createTemplate(duplicate);
  }
}
