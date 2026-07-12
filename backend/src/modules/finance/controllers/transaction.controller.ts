import { Request, Response } from 'express';
import { TransactionService } from '../services/transactionService';
import { handleCreate, handleUpdate, handleDelete } from '../../../core/utils/handler';
import { createTransactionSchema } from './transaction.schemas';
import { parsePageQuery } from '../../../core/shared/utils/date-utils';
import { config } from '../../../core/config/env';
import { asyncHandler } from '../../../core/shared/utils/asyncHandler';

export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { search, month, page, limit, startDate, endDate } = parsePageQuery(req.query);
    const type = req.query.type as any;
    const result = await this.transactionService.findAll({ search, month, type, page, limit, startDate, endDate });
    res.json(result);
  });

  getHistory = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, startDate, endDate } = parsePageQuery(req.query);
    const filters = {
      transactionId: req.query.transactionId ? Number(req.query.transactionId) : undefined,
      changedById: req.query.changedById ? Number(req.query.changedById) : undefined,
      action: req.query.action as string,
      startDate,
      endDate
    };
    const result = await this.transactionService.findAllHistory(page, limit, filters);
    res.json(result);
  });

  getSummary = asyncHandler(async (req: Request, res: Response) => {
    const month = req.query.month as string | undefined;
    res.json(await this.transactionService.getSummary(month));
  });

  getTrends = asyncHandler(async (req: Request, res: Response) => {
    const months = req.query.months ? Number(req.query.months) : config.defaultTrendsMonths;
    res.json(await this.transactionService.getTrends(months));
  });

  getArtistPerformance = asyncHandler(async (req: Request, res: Response) => {
    const month = req.query.month as string | undefined;
    res.json(await this.transactionService.getArtistPerformance(month));
  });

  create = handleCreate(async (data, userId) => this.transactionService.create(data as any, userId), createTransactionSchema);

  update = handleUpdate(async (id, data, userId) => this.transactionService.update(id, data as any, userId));

  delete = handleDelete(async (id, userId) => this.transactionService.delete(id, userId));
}
