import { Request, Response } from 'express';
import { CreamService } from '../services/CreamService';
import { validate } from '../../../shared/utils/validation';
import { createCreamSchema, createCreamSaleSchema } from '../schemas/cream.schemas';
import { parsePageQuery } from '../../../shared/utils/date-utils';
import { parseId } from '../../../shared/utils/parse-id';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

export class CreamController {
  constructor(private readonly creamService: CreamService) {}

  getActive = asyncHandler(async (_req: Request, res: Response) => {
    const result = await this.creamService.findActive();
    if (!result) {
      return res.status(404).json({ success: false, message: 'Nessuna crema attiva trovata' });
    }
    res.json(result);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const data = validate(createCreamSchema, req.body);
    const result = await this.creamService.create(data);
    res.status(201).json(result);
  });

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

  getSalesSummary = asyncHandler(async (_req: Request, res: Response) => {
    const result = await this.creamService.getSalesSummary();
    res.json(result);
  });
}
