import { Response } from 'express';
import { SavedViewService } from '../services/savedViewService';
import { asyncHandler } from '../../../core/shared/utils/asyncHandler';
import { AuthRequest } from '../../../core/middleware/auth.middleware';
import { createSavedViewSchema, updateSavedViewSchema } from '../types/savedView.types';
import { AppError } from '../../../core/shared/errors/AppError';

export class SavedViewController {
  constructor(private savedViewService: SavedViewService) {}

  getSavedViews = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new AppError('Utente non autenticato', 401, 'UNAUTHENTICATED');
    const module = (req.query.module as string) || 'customer';
    const views = await this.savedViewService.getSavedViews(req.user.id, module);
    res.json(views);
  });

  createSavedView = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new AppError('Utente non autenticato', 401, 'UNAUTHENTICATED');
    const data = createSavedViewSchema.parse(req.body);
    const created = await this.savedViewService.createSavedView(req.user.id, data);
    res.status(201).json(created);
  });

  updateSavedView = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new AppError('Utente non autenticato', 401, 'UNAUTHENTICATED');
    const id = Number(req.params.id);
    const data = updateSavedViewSchema.parse(req.body);
    const updated = await this.savedViewService.updateSavedView(req.user.id, id, data);
    res.json(updated);
  });

  deleteSavedView = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new AppError('Utente non autenticato', 401, 'UNAUTHENTICATED');
    const id = Number(req.params.id);
    await this.savedViewService.deleteSavedView(req.user.id, id);
    res.json({ success: true, message: 'Vista salvata eliminata' });
  });

  setDefault = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new AppError('Utente non autenticato', 401, 'UNAUTHENTICATED');
    const id = Number(req.params.id);
    const updated = await this.savedViewService.setDefault(req.user.id, id);
    res.json(updated);
  });
}
