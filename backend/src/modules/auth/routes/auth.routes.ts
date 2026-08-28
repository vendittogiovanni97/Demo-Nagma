import { Express } from 'express';
import { container } from '../../../core/container';
import { adminOnly, authMiddleware } from '../../../core/middleware/auth.middleware';
import { authRateLimiter, loginIpRateLimiter, loginRateLimiter } from '../../../core/middleware/rateLimiter';
import { AuthController } from '../controllers/auth.controller';

export function registerAuthRoutes(app: Express): void {
  const controller = container.get(AuthController);

  // SECURITY (Audit H3): doppio limite — per-account (email) + per-IP anti email-rotation
  app.post('/api/auth/login', loginIpRateLimiter, loginRateLimiter, controller.login);
  // SECURITY (Audit M2): logout server-side — rimuove il cookie httpOnly di sessione
  app.post('/api/auth/logout', authRateLimiter, controller.logout);
  app.post('/api/auth/register', authRateLimiter, authMiddleware, adminOnly, controller.register);
  app.get('/api/auth/me', authMiddleware, controller.me);
  app.put('/api/auth/me', authMiddleware, controller.updateMe);
  app.put('/api/auth/me/theme', authMiddleware, controller.updateTheme);
  app.patch('/api/auth/theme', authMiddleware, controller.updateTheme);
  app.put('/api/auth/me/password', authRateLimiter, authMiddleware, controller.changePassword);
  app.post('/api/auth/refresh', authMiddleware, controller.refresh);
}
