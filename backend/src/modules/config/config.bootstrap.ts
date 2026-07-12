import { container } from '../../core/container';
import { ConfigService } from './services/configService';
import { ConfigController } from './controllers/config.controller';

export function bootstrapConfig(): void {
  const configService = new ConfigService();
  const configController = new ConfigController(configService);
  container.register(ConfigService, configService);
  container.register(ConfigController, configController);
}
