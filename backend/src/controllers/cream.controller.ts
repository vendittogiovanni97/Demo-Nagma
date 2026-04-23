import { Response } from 'express';
import { CreamService } from '../services/cream.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/async-handler';
import { parsePageQuery } from '../utils/date-utils';
import { parseId } from '../utils/parse-id';
import { validate, createCreamSaleSchema } from '../schemas';

const service = new CreamService();

export class CreamController {
  getActive = asyncHandler(async (_req: AuthRequest, res: Response) => {
    res.json(await service.getActive());
  });

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    res.status(201).json(await service.createCream(req.body));
  });

  getSales = asyncHandler(async (req: AuthRequest, res: Response) => {
    const creamId = parseId(req.params.id);
    const { page, limit } = parsePageQuery(req.query);
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const artistId = req.query.artistId ? parseInt(req.query.artistId as string) : undefined;
    res.json(await service.getSalesByCream(creamId, page, limit, { startDate, endDate, artistId }));
  });

  createSale = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = validate(createCreamSaleSchema, req.body);
    res.status(201).json(await service.createSale(data.creamId, data.artistId, data.quantity));
  });

  getSalesSummary = asyncHandler(async (_req: AuthRequest, res: Response) => {
    res.json(await service.getSalesSummary());
  });
}