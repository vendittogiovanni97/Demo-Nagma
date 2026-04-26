import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { validate, createSpesaLiberaSchema } from '../schemas';
import { AppError } from '../utils/AppError';
import { parseId } from '../utils/parse-id';
import { SpesaLiberaService } from '../services/spesa-libera.service';
import { config } from '../config/env';
import { configService } from '../services/config.service';

const service = new SpesaLiberaService();

export class SpesaLiberaController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const month = req.query.month as string | undefined;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : configService.getMaxPageLimitSync();
    const data = await service.getAll(month, page, limit);
    res.json(data);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const validated = validate(createSpesaLiberaSchema, req.body);
    const data = await service.create(validated);
    res.status(201).json({ data });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    const result = await service.delete(id);
    if (!result) {
      throw new AppError('Spesa non trovata', 404, 'NOT_FOUND');
    }
    res.status(204).send();
  });
}
