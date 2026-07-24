import { container } from '../../core/container';
import { ConfigService } from './services/configService';
import { ConfigController } from './controllers/config.controller';
import { DatabaseBackupService } from './services/databaseBackupService';

export function bootstrapConfig(): void {
  const configService = new ConfigService();
  const databaseBackupService = new DatabaseBackupService();
  const configController = new ConfigController(configService, databaseBackupService);
  container.register(ConfigService, configService);
  container.register(DatabaseBackupService, databaseBackupService);
  container.register(ConfigController, configController);
}
