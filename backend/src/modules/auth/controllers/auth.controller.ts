import { Request, Response } from 'express';
import { AuthRequest } from '../../../core/middleware/auth.middleware';
import { AppError } from '../../../core/shared/errors/AppError';
import { asyncHandler } from '../../../core/shared/utils/asyncHandler';
import { clearAuthCookie, setAuthCookie } from '../../../core/shared/utils/cookieAuth';
import { validate } from '../../../core/shared/utils/validation';
import { AuthService } from '../services/authService';
import { changePasswordSchema, loginSchema, registerSchema, updateMeSchema, updateThemeSchema } from './auth.schemas';

export class AuthController {
  constructor(private authService: AuthService) {}

  login = asyncHandler(async (req: Request, res: Response) => {
    const data = validate(loginSchema, req.body);
    const result = await this.authService.login(data);

    // SECURITY (Audit M2): il token viaggia SOLO nel cookie httpOnly, non è
    // più leggibile da JavaScript (mitigazione furto sessione via XSS).
    setAuthCookie(res, result.token);

    res.json({ user: result.user });
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

  updateTheme = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new AppError('Utente non autenticato', 401, 'UNAUTHENTICATED');
    const data = validate(updateThemeSchema, req.body);
    const result = await this.authService.updateTheme(req.user.id, data.theme);
    res.json(result.toJSON());
  });

  refresh = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new AppError('Utente non autenticato', 401, 'UNAUTHENTICATED');
    const result = await this.authService.refreshToken(req.user.id);

    // SECURITY (Audit M2): rotazione del cookie httpOnly con il nuovo token.
    setAuthCookie(res, result.token);

    res.json({ user: result.user });
  });

  logout = asyncHandler(async (_req: Request, res: Response) => {
    // SECURITY (Audit M2): il logout lato server rimuove il cookie httpOnly.
    clearAuthCookie(res);
    res.json({ message: 'Logout effettuato.' });
  });

  changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new AppError('Utente non autenticato', 401, 'UNAUTHENTICATED');
    const data = validate(changePasswordSchema, req.body);
    await this.authService.changePassword(req.user.id, data);
    res.json({ message: 'Password aggiornata con successo.' });
  });
}
