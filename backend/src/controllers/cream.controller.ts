import { Request, Response } from 'express';
import { CreamService } from '../services/cream.service';

const service = new CreamService();

export class CreamController {
  getAll = async (req: Request, res: Response) => {
    try {
      const data = await service.getCreams();
      res.json(data);
    } catch (e: any) {
      res.status(e.status ?? 500).json({ message: e.message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const data = await service.createCream(req.body);
      res.status(201).json(data);
    } catch (e: any) {
      res.status(e.status ?? 500).json({ message: e.message });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const data = await service.updateCream(String(req.params.id), req.body);
      res.json(data);
    } catch (e: any) {
      res.status(e.status ?? 500).json({ message: e.message });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      await service.deleteCream(String(req.params.id));
      res.status(204).send();
    } catch (e: any) {
      res.status(e.status ?? 500).json({ message: e.message });
    }
  };

  getSales = async (req: Request, res: Response) => {
    try {
      const data = await service.getSales(
        req.query.sellerId as string | undefined,
        req.query.month as string | undefined
      );
      res.json(data);
    } catch (e: any) {
      res.status(e.status ?? 500).json({ message: e.message });
    }
  };

  registerSale = async (req: Request, res: Response) => {
    try {
      const data = await service.registerSale(req.body);
      res.status(201).json(data);
    } catch (e: any) {
      res.status(e.status ?? 500).json({ message: e.message });
    }
  };
}
