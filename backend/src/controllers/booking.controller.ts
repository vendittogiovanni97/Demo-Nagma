import { Request, Response } from 'express';
import { BookingService } from '../services/booking.service';

export class BookingController {
  private service = new BookingService();

  getAll = async (req: Request, res: Response) => {
    try {
      const data = await this.service.getBookings(req.query.month as string);
      res.json(data);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  };

  getStats = async (req: Request, res: Response) => {
    try {
      const data = await this.service.getStats(req.query.month as string);
      res.json(data);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  };

  create = async (req: Request, res: Response) => {
    try {
      const data = await this.service.createBooking(req.body);
      res.status(201).json(data);
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  };

  update = async (req: Request, res: Response) => {
    try {
      const data = await this.service.updateBooking(req.params.id as string, req.body);
      res.json(data);
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  };

  delete = async (req: Request, res: Response) => {
    try {
      await this.service.deleteBooking(req.params.id as string);
      res.status(204).send();
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  };
}
