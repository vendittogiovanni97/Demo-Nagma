import { Request, Response } from 'express';
import { EntrataLiberaService } from '../services/entrataLiberaService';
import { handleCreate } from '../../../core/utils/handler';
import { createEntrataLiberaSchema } from './entrata-libera.schemas';
import { parseId } from '../../../core/shared/utils/parse-id';
import { asyncHandler } from '../../../core/shared/utils/asyncHandler';

export class EntrataLiberaController {
  constructor(private entrataLiberaService: EntrataLiberaService) {}

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const month = req.query.month as string | undefined;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const result = await this.entrataLiberaService.findAll(month, page, limit);
    res.json(result);
  });

  create = handleCreate(async (data) => this.entrataLiberaService.create(data), createEntrataLiberaSchema);

  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    await this.entrataLiberaService.delete(id);
    res.status(204).send();
  });
}
