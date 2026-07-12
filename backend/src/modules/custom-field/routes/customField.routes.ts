import { Express } from 'express';
import { container } from '../../../core/container';
import { CustomFieldController } from '../controllers/customField.controller';
import { authMiddleware, adminOnly } from '../../../core/middleware/auth.middleware';

export function registerCustomFieldRoutes(app: Express): void {
  const controller = container.get(CustomFieldController);

  app.get('/api/custom-fields', authMiddleware, controller.getAll);
  app.get('/api/custom-fields/:id', authMiddleware, controller.getById);
  app.post('/api/custom-fields', authMiddleware, adminOnly, controller.create);
  app.put('/api/custom-fields/:id', authMiddleware, adminOnly, controller.update);
  app.delete('/api/custom-fields/:id', authMiddleware, adminOnly, controller.delete);
  app.post('/api/custom-fields/validate', authMiddleware, controller.validate);
}