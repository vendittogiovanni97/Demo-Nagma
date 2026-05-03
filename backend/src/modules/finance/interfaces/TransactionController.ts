import { Request, Response } from 'express';
import { ListTransactions } from '../application/ListTransactions';
import { CreateTransaction } from '../application/CreateTransaction';
import { DeleteTransaction } from '../application/DeleteTransaction';
import { GetFinanceSummary } from '../application/GetFinanceSummary';
import { GetTrends } from '../application/GetTrends';
import { GetArtistPerformance } from '../application/GetArtistPerformance';
import { validate } from '../../../shared/utils/validation';
import { createTransactionSchema } from './transaction.schemas';
import { parsePageQuery } from '../../../shared/utils/date-utils';
import { parseId } from '../../../shared/utils/parse-id';
import { config } from '../../../config/env';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

export class TransactionController {
  constructor(
    private listTransactionsUseCase: ListTransactions,
    private createTransactionUseCase: CreateTransaction,
    private deleteTransactionUseCase: DeleteTransaction,
    private getFinanceSummaryUseCase: GetFinanceSummary,
    private getTrendsUseCase: GetTrends,
    private getArtistPerformanceUseCase: GetArtistPerformance
  ) {}

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { search, month, page, limit } = parsePageQuery(req.query);
    const type = req.query.type as any;
    const result = await this.listTransactionsUseCase.execute({ search, month, type, page, limit });
    res.json({
      ...result,
      data: result.data.map(t => t.toJSON())
    });
  });

  getSummary = asyncHandler(async (req: Request, res: Response) => {
    const month = req.query.month as string | undefined;
    res.json(await this.getFinanceSummaryUseCase.execute(month));
  });

  getTrends = asyncHandler(async (req: Request, res: Response) => {
    const months = req.query.months ? Number(req.query.months) : config.defaultTrendsMonths;
    res.json(await this.getTrendsUseCase.execute(months));
  });

  getArtistPerformance = asyncHandler(async (req: Request, res: Response) => {
    const month = req.query.month as string | undefined;
    res.json(await this.getArtistPerformanceUseCase.execute(month));
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const data = validate(createTransactionSchema, req.body);
    const result = await this.createTransactionUseCase.execute(data as any);
    res.status(201).json(result.toJSON());
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.deleteTransactionUseCase.execute(parseId(req.params.id));
    res.status(204).send();
  });
}
