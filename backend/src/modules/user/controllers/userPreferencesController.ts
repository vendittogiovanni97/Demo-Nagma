import { Response } from 'express';
import { UserPreferencesService } from '../services/userPreferencesService';
import { asyncHandler } from '../../../core/shared/utils/asyncHandler';
import { AuthRequest } from '../../../core/middleware/auth.middleware';
import { updateUserPreferencesSchema } from '../types/userPreferences.types';
import { AppError } from '../../../core/shared/errors/AppError';

export class UserPreferencesController {
  constructor(private userPreferencesService: UserPreferencesService) {}

  getPreferences = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new AppError('Utente non autenticato', 401, 'UNAUTHENTICATED');
    const preferences = await this.userPreferencesService.getPreferences(req.user.id);
    res.json(preferences);
  });

  updatePreferences = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new AppError('Utente non autenticato', 401, 'UNAUTHENTICATED');
    const data = updateUserPreferencesSchema.parse(req.body);
    const updated = await this.userPreferencesService.updatePreferences(req.user.id, data);
    res.json(updated);
  });
}
