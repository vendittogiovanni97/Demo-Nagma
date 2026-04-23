import { Response } from 'express';
import { FormTemplateRepository } from '../repositories/form-template.repository';
import { AuthRequest } from '../middlewares/auth.middleware';
import { validate, createFormTemplateSchema, updateFormTemplateSchema } from '../schemas';
import { asyncHandler } from '../utils/async-handler';
import { AppError } from '../utils/AppError';

const repo = new FormTemplateRepository();

export class FormTemplateController {
  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    res.json(await repo.findAll(startDate, endDate));
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const template = await repo.findById(Number(req.params.id));
    if (!template) throw new AppError('Template non trovato', 404, 'NOT_FOUND');
    res.json(template);
  });

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = validate(createFormTemplateSchema, req.body);
    res.status(201).json(await repo.create(data));
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = validate(updateFormTemplateSchema, req.body);
    res.json(await repo.update(Number(req.params.id), data));
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    await repo.delete(Number(req.params.id));
    res.status(204).send();
  });
}
