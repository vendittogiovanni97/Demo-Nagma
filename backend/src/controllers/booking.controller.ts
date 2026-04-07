import { Request, Response } from 'express';
import { BookingService } from '../services/booking.service';

const service = new BookingService();

export class BookingController {
  getAll = async (req: Request, res: Response) => {
    try {
      const data = await service.getBookings(req.query.month as string | undefined);
      res.json(data);
    } catch (e: any) {
      res.status(e.status ?? 500).json({ message: e.message });
    }
  };

  getStats = async (req: Request, res: Response) => {
    try {
      const data = await service.getStats(req.query.month as string | undefined);
      res.json(data);
    } catch (e: any) {
      res.status(e.status ?? 500).json({ message: e.message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const data = await service.createBooking(req.body);
      res.status(201).json(data);
    } catch (e: any) {
      res.status(e.status ?? 500).json({ message: e.message });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const data = await service.updateBooking(String(req.params.id), req.body);
      res.json(data);
    } catch (e: any) {
      res.status(e.status ?? 500).json({ message: e.message });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      await service.deleteBooking(String(req.params.id));
      res.status(204).send();
    } catch (e: any) {
      res.status(e.status ?? 500).json({ message: e.message });
    }
  };
}
