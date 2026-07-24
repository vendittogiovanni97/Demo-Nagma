import { Request, Response } from 'express';
import { CreamService } from '../services/CreamService';
import { handleCreate, handleDelete } from '../../../core/utils/handler';
import { validate } from '../../../core/shared/utils/validation';
import { createCreamSchema, createCreamSaleSchema } from './cream.schemas';
import { parsePageQuery } from '../../../core/shared/utils/date-utils';
import { parseId } from '../../../core/shared/utils/parse-id';
import { asyncHandler } from '../../../core/shared/utils/asyncHandler';

export class CreamController {
  constructor(private readonly creamService: CreamService) {}

  getActive = asyncHandler(async (_req: Request, res: Response) => {
    const result = await this.creamService.findActive();
    if (!result) {
      return res.status(404).json({ success: false, message: 'Nessuna crema attiva trovata' });
    }
    res.json(result);
  });

  create = handleCreate(async (data) => this.creamService.create(data), createCreamSchema);

  getSales = asyncHandler(async (req: Request, res: Response) => {
    const creamId = parseId(req.params.id);
    const { page, limit } = parsePageQuery(req.query);
    const filters = {
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      artistId: req.query.artistId ? parseInt(req.query.artistId as string) : undefined,
    };
    const result = await this.creamService.findSalesByCreamPaged(creamId, page, limit, filters);
    res.json(result);
  });

  createSale = asyncHandler(async (req: Request, res: Response) => {
    const data = validate(createCreamSaleSchema, req.body);
    const result = await this.creamService.createSale(data);
    res.status(201).json(result);
  });

  deleteSale = handleDelete(async (id) => this.creamService.deleteSale(id));

  getSalesSummary = asyncHandler(async (_req: Request, res: Response) => {
    const result = await this.creamService.getSalesSummary();
    res.json(result);
  });
}
