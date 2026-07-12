import { Request, Response } from 'express';
import { AuthRequest } from '../../../core/middleware/auth.middleware';
import { AuthService } from '../services/authService';
import { validate } from '../../../core/shared/utils/validation';
import { loginSchema, registerSchema, updateMeSchema, changePasswordSchema } from './auth.schemas';
import { AppError } from '../../../core/shared/errors/AppError';
import { asyncHandler } from '../../../core/shared/utils/asyncHandler';

export class AuthController {
  constructor(private authService: AuthService) {}

  login = asyncHandler(async (req: Request, res: Response) => {
    const data = validate(loginSchema, req.body);
    const result = await this.authService.login(data);
    res.json(result);
  });

  register = asyncHandler(async (req: Request, res: Response) => {
    const data = validate(registerSchema, req.body);
    const result = await this.authService.register(data);
    res.status(201).json({
      message: 'Utente registrato con successo.',
      user: result.toJSON(),
    });
  });

  me = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new AppError('Utente non autenticato', 401, 'UNAUTHENTICATED');
    const result = await this.authService.getMe(req.user.id);
    res.json(result.toJSON());
  });

  updateMe = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new AppError('Utente non autenticato', 401, 'UNAUTHENTICATED');
    const data = validate(updateMeSchema, req.body);
    const result = await this.authService.updateMe(req.user.id, data);
    res.json(result.toJSON());
  });

  refresh = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new AppError('Utente non autenticato', 401, 'UNAUTHENTICATED');
    const result = await this.authService.refreshToken(req.user.id);
    res.json(result);
  });

  changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new AppError('Utente non autenticato', 401, 'UNAUTHENTICATED');
    const data = validate(changePasswordSchema, req.body);
    await this.authService.changePassword(req.user.id, data);
    res.json({ message: 'Password aggiornata con successo.' });
  });
}
