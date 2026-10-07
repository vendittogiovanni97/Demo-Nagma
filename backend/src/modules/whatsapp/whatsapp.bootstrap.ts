import { container } from '../../core/container';
import { WhatsAppService } from './services/whatsappService';
import { BirthdayReminderService, BirthdayReminderScheduler } from './services/birthdayReminder.service';
import { BaileysService } from './services/baileys.service';
import { WhatsAppController } from './controllers/whatsapp.controller';
import { isFeatureEnabled } from '../../core/middleware/featureFlag.middleware';

export function bootstrapWhatsApp(): void {
  const service = new WhatsAppService();
  const baileysService = new BaileysService();
  const birthdayService = new BirthdayReminderService(service, baileysService);
  const birthdayScheduler = new BirthdayReminderScheduler(birthdayService, () => isFeatureEnabled('enableWhatsApp'));
  const controller = new WhatsAppController(service, birthdayService, baileysService);

  void baileysService.resumeSavedSession();

  container.register(WhatsAppService, service);
  container.register(BaileysService, baileysService);
  container.register(BirthdayReminderService, birthdayService);
  container.register(BirthdayReminderScheduler, birthdayScheduler);
  container.register(WhatsAppController, controller);
}
