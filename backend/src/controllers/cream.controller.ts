import { Request, Response } from 'express';
import { CreamService } from '../services/cream.service';
import { asyncHandler } from '../utils/async-handler';

const service = new CreamService();

export class CreamController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const data = await service.getCreams(
      req.query.search as string | undefined,
      req.query.stockStatus as string | undefined,
      req.query.page ? Number(req.query.page) : 1,
      req.query.limit ? Number(req.query.limit) : 12
    );
    res.json(data);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const data = await service.createCream(req.body);
    res.status(201).json(data);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const data = await service.updateCream(String(req.params.id), req.body);
    res.json(data);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await service.deleteCream(String(req.params.id));
    res.status(204).send();
  });

  getSales = asyncHandler(async (req: Request, res: Response) => {
    const data = await service.getSales(
      req.query.sellerId as string | undefined,
      req.query.month as string | undefined
    );
    res.json(data);
  });

  registerSale = asyncHandler(async (req: Request, res: Response) => {
    const data = await service.registerSale(req.body);
    res.status(201).json(data);
  });
}
