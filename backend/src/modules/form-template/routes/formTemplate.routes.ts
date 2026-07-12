import { Express } from 'express';
import { container } from '../../../core/container';
import { FormTemplateController } from '../controllers/formTemplate.controller';
import { registerCrudRoutes } from '../../../core/utils/crudRoutes';
import { authMiddleware, adminOnly } from '../../../core/middleware/auth.middleware';

export function registerFormTemplateRoutes(app: Express): void {
  const controller = container.get(FormTemplateController);

  registerCrudRoutes(app, {
    basePath: '/api/form-templates',
    handlers: {
      search: controller.search,
      getById: controller.getById,
      create: controller.create,
      update: controller.update,
      delete: controller.delete,
    },
    middlewares: {
      create: [authMiddleware, adminOnly],
      update: [authMiddleware, adminOnly],
      delete: [authMiddleware, adminOnly],
    },
  });
}
