import { container } from '../../core/container';
import { AuthService } from './services/authService';
import { AuthController } from './controllers/auth.controller';

export function bootstrapAuth(): void {
  const authService = new AuthService();
  const authController = new AuthController(authService);
  container.register(AuthService, authService);
  container.register(AuthController, authController);
}
