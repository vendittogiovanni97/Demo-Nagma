import { container } from '../../core/container';
import { WhatsAppService } from './services/whatsappService';
import { WhatsAppController } from './controllers/whatsapp.controller';

export function bootstrapWhatsApp(): void {
  const service = new WhatsAppService();
  const controller = new WhatsAppController(service);

  container.register(WhatsAppService, service);
  container.register(WhatsAppController, controller);
}
