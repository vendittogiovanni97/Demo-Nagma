import { IWhatsAppRepository } from '../contracts/IWhatsAppRepository';
import { CreateWhatsAppTemplateDTO } from '../contracts/WhatsAppDTOs';
import { WhatsAppTemplate } from '../domain/WhatsAppTemplate';

export class CreateWhatsAppTemplate {
  constructor(private whatsappRepository: IWhatsAppRepository) {}

  async execute(data: CreateWhatsAppTemplateDTO): Promise<WhatsAppTemplate> {
    const template = new WhatsAppTemplate({
      name: data.name,
      category: data.category,
      body: data.body,
      isActive: data.isActive ?? true,
    });
    return this.whatsappRepository.createTemplate(template);
  }
}
