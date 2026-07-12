import { container } from '../../../core/container';
import { ConfigService } from '../../../modules/config/services/configService';
import { ConsentService } from './services/consentService';
import { ConsentController } from './controllers/consent.controller';

export function bootstrapConsenso(): void {
  const configService = container.get(ConfigService);
  const consentService = new ConsentService();
  const consentController = new ConsentController(consentService, configService);
  container.register(ConsentService, consentService);
  container.register(ConsentController, consentController);
}
