import { Request, Response } from 'express';
import { AuthRequest } from '../../../middlewares/auth.middleware';
import { GetActiveCream } from '../application/GetActiveCream';
import { CreateCream } from '../application/CreateCream';
import { CreateCreamSale } from '../application/CreateCreamSale';
import { GetCreamSales } from '../application/GetCreamSales';
import { GetCreamSalesSummary } from '../application/GetCreamSalesSummary';
import { validate } from '../../../shared/utils/validation';
import { createCreamSchema, createCreamSaleSchema } from './cream.schemas';
import { parsePageQuery } from '../../../shared/utils/date-utils';
import { parseId } from '../../../shared/utils/parse-id';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

export class CreamController {
  constructor(
    private getActiveCreamUseCase: GetActiveCream,
    private createCreamUseCase: CreateCream,
    private createCreamSaleUseCase: CreateCreamSale,
    private getCreamSalesUseCase: GetCreamSales,
    private getCreamSalesSummaryUseCase: GetCreamSalesSummary
  ) {}

  getActive = asyncHandler(async (_req: Request, res: Response) => {
    const result = await this.getActiveCreamUseCase.execute();
    res.json(result.toJSON());
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const data = validate(createCreamSchema, req.body);
    const result = await this.createCreamUseCase.execute(data as any);
    res.status(201).json(result.toJSON());
  });

  getSales = asyncHandler(async (req: Request, res: Response) => {
    const creamId = parseId(req.params.id);
    const { page, limit } = parsePageQuery(req.query);
    const filters = {
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      artistId: req.query.artistId ? parseInt(req.query.artistId as string) : undefined,
    };
    const result = await this.getCreamSalesUseCase.execute(creamId, page, limit, filters);
    res.json({
      ...result,
      data: result.data.map(s => s.toJSON())
    });
  });

  createSale = asyncHandler(async (req: Request, res: Response) => {
    const data = validate(createCreamSaleSchema, req.body);
    const result = await this.createCreamSaleUseCase.execute(data as any);
    res.status(201).json(result.toJSON());
  });

  getSalesSummary = asyncHandler(async (_req: Request, res: Response) => {
    const result = await this.getCreamSalesSummaryUseCase.execute();
    res.json(result);
  });
}
