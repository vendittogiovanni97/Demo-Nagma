import { Response } from 'express';
import { FormTemplateService } from '../services/form-template.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/async-handler';

const service = new FormTemplateService();

export class FormTemplateController {
  getAll = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const data = await service.getAll();
    res.json(data);
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await service.getById(String(req.params.id));
    res.json(data);
  });

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await service.create(req.body);
    res.status(201).json(data);
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await service.update(String(req.params.id), req.body);
    res.json(data);
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    await service.delete(String(req.params.id));
    res.status(204).send();
  });
}
