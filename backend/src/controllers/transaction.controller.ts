import { Request, Response } from 'express';
import { TransactionService } from '../services/transaction.service';

const service = new TransactionService();

export class TransactionController {
  getAll = async (req: Request, res: Response) => {
    try {
      const data = await service.getTransactions(
        req.query.type as string | undefined,
        req.query.month as string | undefined
      );
      res.json(data);
    } catch (e: any) {
      res.status(e.status ?? 500).json({ message: e.message });
    }
  };

  getSummary = async (req: Request, res: Response) => {
    try {
      const data = await service.getSummary(req.query.month as string | undefined);
      res.json(data);
    } catch (e: any) {
      res.status(e.status ?? 500).json({ message: e.message });
    }
  };

  getTrends = async (req: Request, res: Response) => {
    try {
      const months = req.query.months ? Number(req.query.months) : 6;
      const data = await service.getTrends(months);
      res.json(data);
    } catch (e: any) {
      res.status(e.status ?? 500).json({ message: e.message });
    }
  };

  getArtistPerformance = async (req: Request, res: Response) => {
    try {
      const data = await service.getArtistPerformance();
      res.json(data);
    } catch (e: any) {
      res.status(e.status ?? 500).json({ message: e.message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const data = await service.createTransaction(req.body);
      res.status(201).json(data);
    } catch (e: any) {
      res.status(e.status ?? 500).json({ message: e.message });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      await service.deleteTransaction(String(req.params.id));
      res.status(204).send();
    } catch (e: any) {
      res.status(e.status ?? 500).json({ message: e.message });
    }
  };
}
