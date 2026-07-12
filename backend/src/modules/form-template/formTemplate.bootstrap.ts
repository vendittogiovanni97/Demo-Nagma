import { container } from '../../core/container';
import { FormTemplateService } from './services/formTemplateService';
import { FormTemplateController } from './controllers/formTemplate.controller';

export function bootstrapFormTemplate(): void {
  const service = new FormTemplateService();
  const controller = new FormTemplateController(service);

  container.register(FormTemplateService, service);
  container.register(FormTemplateController, controller);
}
