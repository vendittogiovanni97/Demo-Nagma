import { Request, Response } from 'express';
import { config } from '../config/env';
import { TransactionService } from '../services/transaction.service';
import { asyncHandler } from '../utils/async-handler';
import { parsePageQuery } from '../utils/date-utils';
import { parseId } from '../utils/parse-id';

const service = new TransactionService();

export class TransactionController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { search, month, page, limit } = parsePageQuery(req.query);
    res.json(await service.getTransactions(
      req.query.type as string | undefined,
      month, search, page, limit,
    ));
  });

  getSummary = asyncHandler(async (req: Request, res: Response) => {
    res.json(await service.getSummary(req.query.month as string | undefined));
  });

  getTrends = asyncHandler(async (req: Request, res: Response) => {
    const months = req.query.months ? Number(req.query.months) : config.defaultTrendsMonths;
    res.json(await service.getTrends(months));
  });

  getArtistPerformance = asyncHandler(async (_req: Request, res: Response) => {
    res.json(await service.getArtistPerformance());
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(await service.createTransaction(req.body));
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await service.deleteTransaction(parseId(req.params.id));
    res.status(204).send();
  });
}
