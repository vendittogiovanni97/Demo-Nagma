import { Express, Router } from 'express';
import { container } from '../../../core/container';
import { SavedViewController } from '../controllers/savedViewController';
import { authMiddleware } from '../../../core/middleware/auth.middleware';

export function registerSavedViewRoutes(app: Express): void {
  const controller = container.get(SavedViewController);
  const router = Router();

  router.use(authMiddleware);

  router.get('/', controller.getSavedViews);
  router.post('/', controller.createSavedView);
  router.patch('/:id', controller.updateSavedView);
  router.delete('/:id', controller.deleteSavedView);
  router.patch('/:id/set-default', controller.setDefault);

  app.use('/api/saved-views', router);
}
