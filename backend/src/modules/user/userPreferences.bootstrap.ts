import { container } from '../../core/container';
import { UserPreferencesService } from './services/userPreferencesService';
import { UserPreferencesController } from './controllers/userPreferencesController';

export function bootstrapUserPreferences(): void {
  const service = new UserPreferencesService();
  const controller = new UserPreferencesController(service);

  container.register(UserPreferencesService, service);
  container.register(UserPreferencesController, controller);
}
