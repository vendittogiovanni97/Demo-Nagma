import { IWhatsAppRepository } from '../contracts/IWhatsAppRepository';
import { UpdateWhatsAppTemplateDTO } from '../contracts/WhatsAppDTOs';
import { WhatsAppTemplate } from '../domain/WhatsAppTemplate';
import { AppError } from '../../../shared/errors/AppError';

export class UpdateWhatsAppTemplate {
  constructor(private whatsappRepository: IWhatsAppRepository) {}

  async execute(id: number, data: UpdateWhatsAppTemplateDTO): Promise<WhatsAppTemplate> {
    const existing = await this.whatsappRepository.findTemplateById(id);
    if (!existing) throw new AppError('Template non trovato', 404, 'WHATSAPP_TEMPLATE_NOT_FOUND');

    return this.whatsappRepository.updateTemplate(id, data);
  }
}
