import { Express, Router } from 'express';
import { container } from '../../../core/container';
import { UserPreferencesController } from '../controllers/userPreferencesController';
import { authMiddleware } from '../../../core/middleware/auth.middleware';

export function registerUserPreferencesRoutes(app: Express): void {
  const controller = container.get(UserPreferencesController);
  const router = Router();

  router.use(authMiddleware);
  router.get('/preferences', controller.getPreferences);
  router.patch('/preferences', controller.updatePreferences);

  app.use('/api/user', router);
}
