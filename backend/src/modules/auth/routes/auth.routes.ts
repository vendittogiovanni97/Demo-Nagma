import { Express } from 'express';
import { container } from '../../../core/container';
import { AuthController } from '../controllers/auth.controller';
import { adminOnly, authMiddleware } from '../../../core/middleware/auth.middleware';
import { authRateLimiter, loginRateLimiter } from '../../../core/middleware/rateLimiter';

export function registerAuthRoutes(app: Express): void {
  const controller = container.get(AuthController);

  app.post('/api/auth/login', loginRateLimiter, controller.login);
  app.post('/api/auth/register', authRateLimiter, authMiddleware, adminOnly, controller.register);
  app.get('/api/auth/me', authMiddleware, controller.me);
  app.put('/api/auth/me', authMiddleware, controller.updateMe);
  app.put('/api/auth/me/password', authRateLimiter, authMiddleware, controller.changePassword);
  app.post('/api/auth/refresh', authMiddleware, controller.refresh);
}
