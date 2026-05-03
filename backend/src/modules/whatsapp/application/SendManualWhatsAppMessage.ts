import { IWhatsAppRepository } from '../contracts/IWhatsAppRepository';
import { SendWhatsAppMessageDTO } from '../contracts/WhatsAppDTOs';
import { WhatsAppLog } from '../domain/WhatsAppLog';
import { renderTemplate, normalizePhoneNumber } from './helpers';
import { AppError } from '../../../shared/errors/AppError';

export class SendManualWhatsAppMessage {
  constructor(private whatsappRepository: IWhatsAppRepository) {}

  async execute(data: SendWhatsAppMessageDTO, userId: number): Promise<{ log: WhatsAppLog; whatsappUrl: string; message: string }> {
    let templateBody = data.message || '';
    let templateName: string | null = null;

    if (data.templateId) {
      const template = await this.whatsappRepository.findTemplateById(data.templateId);
      if (!template) {
        throw new AppError('Template WhatsApp non trovato', 404, 'WHATSAPP_TEMPLATE_NOT_FOUND');
      }

      if (!template.isActive) {
        throw new AppError('Il template selezionato non è attivo', 400, 'WHATSAPP_TEMPLATE_INACTIVE');
      }

      templateBody = data.message?.trim() || template.body;
      templateName = template.name;
    }

    if (!templateBody.trim()) {
      throw new AppError('Il messaggio da inviare è obbligatorio', 400, 'WHATSAPP_MESSAGE_REQUIRED');
    }

    const renderedMessage = renderTemplate(templateBody, data.variables);
    const recipientPhone = normalizePhoneNumber(data.recipientPhone);
    const whatsappUrl = `https://wa.me/${recipientPhone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(renderedMessage)}`;

    const log = new WhatsAppLog({
      templateId: data.templateId || null,
      bookingId: data.bookingId || null,
      customerId: data.customerId || null,
      createdById: userId,
      recipientName: data.recipientName || null,
      recipientPhone,
      templateName,
      message: renderedMessage,
      status: 'MANUAL_SENT',
      variablesJson: data.variables,
    });

    const savedLog = await this.whatsappRepository.createLog(log);

    return {
      log: savedLog,
      whatsappUrl,
      message: renderedMessage,
    };
  }
}
