import { Request, Response } from 'express';
import { CreamService } from '../services/cream.service';

export class CreamController {
  private service = new CreamService();

  getAll = async (req: Request, res: Response) => {
    try {
      const data = await this.service.getCreams();
      res.json(data);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  };

  create = async (req: Request, res: Response) => {
    try {
      const data = await this.service.createCream(req.body);
      res.status(201).json(data);
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  };

  update = async (req: Request, res: Response) => {
    try {
      const data = await this.service.updateCream(req.params.id as string, req.body);
      res.json(data);
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  };

  getSales = async (req: Request, res: Response) => {
    try {
      const data = await this.service.getSales(req.query.sellerId as string, req.query.month as string);
      res.json(data);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  };

  registerSale = async (req: Request, res: Response) => {
    try {
      const data = await this.service.registerSale(req.body);
      res.status(201).json(data);
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  };
}
