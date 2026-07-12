import { Container } from '@/core/container';
import { TemplateService } from './template.service';
import { TemplateController } from './template.controller';

export function bootstrapTemplate(): void {
  const templateService = new TemplateService();
  const templateController = new TemplateController();

  container.register(TemplateService, templateService);
  container.register(TemplateController, templateController);
}