import { Request, Response } from 'express';
import { AuthRequest } from '../../../middlewares/auth.middleware';
import { Login } from '../application/Login';
import { Register } from '../application/Register';
import { GetMe } from '../application/GetMe';
import { UpdateMe } from '../application/UpdateMe';
import { ChangePassword } from '../application/ChangePassword';
import { RefreshToken } from '../application/RefreshToken';
import { validate } from '../../../shared/utils/validation';
import { loginSchema, registerSchema, updateMeSchema, changePasswordSchema } from './auth.schemas';
import { AppError } from '../../../shared/errors/AppError';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

export class AuthController {
  constructor(
    private loginUseCase: Login,
    private registerUseCase: RegisterUseCase,
    private getMeUseCase: GetMe,
    private updateMeUseCase: UpdateMe,
    private changePasswordUseCase: ChangePassword,
    private refreshTokenUseCase: RefreshToken
  ) {}

  login = asyncHandler(async (req: Request, res: Response) => {
    const data = validate(loginSchema, req.body);
    const result = await this.loginUseCase.execute(data as any);
    res.json(result);
  });

  register = asyncHandler(async (req: Request, res: Response) => {
    const data = validate(registerSchema, req.body);
    const result = await this.registerUseCase.execute(data as any);
    res.status(201).json({
      message: 'Utente registrato con successo.',
      user: result.toJSON(),
    });
  });

  me = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new AppError('Utente non autenticato', 401, 'UNAUTHENTICATED');
    const result = await this.getMeUseCase.execute(req.user.id);
    res.json(result.toJSON());
  });

  updateMe = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new AppError('Utente non autenticato', 401, 'UNAUTHENTICATED');
    const data = validate(updateMeSchema, req.body);
    const result = await this.updateMeUseCase.execute(req.user.id, data as any);
    res.json(result.toJSON());
  });

  refresh = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new AppError('Utente non autenticato', 401, 'UNAUTHENTICATED');
    const result = await this.refreshTokenUseCase.execute(req.user.id);
    res.json(result);
  });

  changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new AppError('Utente non autenticato', 401, 'UNAUTHENTICATED');
    const data = validate(changePasswordSchema, req.body);
    await this.changePasswordUseCase.execute(req.user.id, data as any);
    res.json({ message: 'Password aggiornata con successo.' });
  });
}

type RegisterUseCase = Register;
