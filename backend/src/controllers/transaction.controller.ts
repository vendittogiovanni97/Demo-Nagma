import { Request, Response } from 'express';
import { config } from '../config/env';
import { TransactionService } from '../services/transaction.service';
import { asyncHandler } from '../utils/async-handler';

const service = new TransactionService();

export class TransactionController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const data = await service.getTransactions(
      req.query.type as string | undefined,
      req.query.month as string | undefined,
      req.query.search as string | undefined,
      req.query.page ? Number(req.query.page) : 1,
      req.query.limit ? Number(req.query.limit) : 20
    );
    res.json(data);
  });

  getSummary = asyncHandler(async (req: Request, res: Response) => {
    const data = await service.getSummary(req.query.month as string | undefined);
    res.json(data);
  });

  getTrends = asyncHandler(async (req: Request, res: Response) => {
    const months = req.query.months ? Number(req.query.months) : config.defaultTrendsMonths;
    const data = await service.getTrends(months);
    res.json(data);
  });

  getArtistPerformance = asyncHandler(async (_req: Request, res: Response) => {
    const data = await service.getArtistPerformance();
    res.json(data);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const data = await service.createTransaction(req.body);
    res.status(201).json(data);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await service.deleteTransaction(String(req.params.id));
    res.status(204).send();
  });
}
