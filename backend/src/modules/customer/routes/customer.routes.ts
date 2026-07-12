import { Express } from 'express';
import { container } from '../../../core/container';
import { CustomerController } from '../controllers/customer.controller';
import { registerCrudRoutes } from '../../../core/utils/crudRoutes';
import { authMiddleware, requireRoles } from '../../../core/middleware/auth.middleware';

export function registerCustomerRoutes(app: Express): void {
  const controller = container.get(CustomerController);

  registerCrudRoutes(app, {
    basePath: '/api/customers',
    handlers: {
      search: controller.search,
      getById: controller.getById,
      create: controller.create,
      update: controller.update,
      delete: controller.delete,
    },
    middlewares: {
      create: [authMiddleware, requireRoles('ADMIN', 'SUPER_ADMIN')],
      update: [authMiddleware, requireRoles('ADMIN', 'SUPER_ADMIN')],
      delete: [authMiddleware, requireRoles('ADMIN', 'SUPER_ADMIN')],
    },
  });

  app.get('/api/customers/:id/summary', authMiddleware, requireRoles('USER', 'ADMIN', 'SUPER_ADMIN'), controller.getSummary);
}
