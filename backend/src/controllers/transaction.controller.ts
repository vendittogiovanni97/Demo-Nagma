import { Request, Response } from 'express';
import { TransactionService } from '../services/transaction.service';

export class TransactionController {
  private service = new TransactionService();

  getAll = async (req: Request, res: Response) => {
    try {
      const trans = await this.service.getTransactions(req.query.type as string, req.query.month as string);
      res.json(trans);
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  };

  getSummary = async (req: Request, res: Response) => {
    try {
      const sum = await this.service.getSummary(req.query.month as string);
      res.json(sum);
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const trans = await this.service.createTransaction(req.body);
      res.status(201).json(trans);
    } catch (e: any) {
      res.status(400).json({ status: 'error', message: e.message });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      await this.service.deleteTransaction(req.params.id as string);
      res.status(204).send();
    } catch (e: any) {
      res.status(400).json({ status: 'error', message: e.message });
    }
  };

  getTrends = async (req: Request, res: Response) => {
    try {
      const months = req.query.months ? Number(req.query.months) : 6;
      const trends = await this.service.getTrends(months);
      res.json(trends);
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  };

  getArtistPerformance = async (req: Request, res: Response) => {
    try {
      const perf = await this.service.getArtistPerformance();
      res.json(perf);
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  };
}
