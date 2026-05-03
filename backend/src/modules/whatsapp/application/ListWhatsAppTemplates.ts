import { IWhatsAppRepository, WhatsAppTemplateTemplatesFilters } from '../contracts/IWhatsAppRepository';
import { WhatsAppTemplate } from '../domain/WhatsAppTemplate';

export class ListWhatsAppTemplates {
  constructor(private whatsappRepository: IWhatsAppRepository) {}

  async execute(filters: WhatsAppTemplateTemplatesFilters): Promise<WhatsAppTemplate[]> {
    return this.whatsappRepository.findAllTemplates(filters);
  }
}
