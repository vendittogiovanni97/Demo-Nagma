import { Request, Response } from 'express';
import { SpesaLiberaService } from '../services/spesaLiberaService';
import { handleCreate } from '../../../core/utils/handler';
import { createSpesaLiberaSchema } from './spesa-libera.schemas';
import { parseId } from '../../../core/shared/utils/parse-id';
import { asyncHandler } from '../../../core/shared/utils/asyncHandler';

export class SpesaLiberaController {
  constructor(private spesaLiberaService: SpesaLiberaService) {}

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const month = req.query.month as string | undefined;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const result = await this.spesaLiberaService.findAll(month, page, limit);
    res.json(result);
  });

  create = handleCreate(async (data) => this.spesaLiberaService.create(data), createSpesaLiberaSchema);

  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    await this.spesaLiberaService.delete(id);
    res.status(204).send();
  });
}
