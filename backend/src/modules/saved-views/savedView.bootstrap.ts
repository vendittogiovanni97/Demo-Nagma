import { container } from '../../core/container';
import { SavedViewService } from './services/savedViewService';
import { SavedViewController } from './controllers/savedViewController';

export function bootstrapSavedView(): void {
  const service = new SavedViewService();
  const controller = new SavedViewController(service);

  container.register(SavedViewService, service);
  container.register(SavedViewController, controller);
}
