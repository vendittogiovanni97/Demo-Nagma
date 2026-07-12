import { Router } from 'express';
import { TemplateController } from './template.controller';

export function registerTemplateRoutes(router: Router) {
  const controller = new TemplateController();

  // Template routes
  router.get('/', controller.search);
  router.get('/:id', controller.getById);
  router.post('/', controller.create);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.remove);
}