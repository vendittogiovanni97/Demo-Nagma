import { Express } from 'express';
import { container } from '../../../core/container';
import { FormTemplateController } from '../controllers/formTemplate.controller';
import { registerCrudRoutes } from '../../../core/utils/crudRoutes';
import { authMiddleware, adminOnly } from '../../../core/middleware/auth.middleware';
import { requireFeature } from '../../../core/middleware/featureFlag.middleware';

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
      search: [authMiddleware, requireFeature('enableFormTemplate')],
      getById: [authMiddleware, requireFeature('enableFormTemplate')],
      create: [authMiddleware, adminOnly, requireFeature('enableFormTemplate')],
      update: [authMiddleware, adminOnly, requireFeature('enableFormTemplate')],
      delete: [authMiddleware, adminOnly, requireFeature('enableFormTemplate')],
    },
  });
}