import { container } from '../../core/container';
import { CustomFieldService } from './services/customFieldService';
import { CustomFieldController } from './controllers/customField.controller';

export function bootstrapCustomField(): void {
  const customFieldService = new CustomFieldService();
  const customFieldController = new CustomFieldController(customFieldService);
  container.register(CustomFieldService, customFieldService);
  container.register(CustomFieldController, customFieldController);
}