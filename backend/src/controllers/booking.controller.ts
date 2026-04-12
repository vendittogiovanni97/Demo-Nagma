import { Response } from 'express';
import { BookingService } from '../services/booking.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/async-handler';

const service = new BookingService();

export class BookingController {
  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const month = req.query.month as string | undefined;
    // Paginazione opzionale: se page o limit sono presenti, ritorna shape paginata.
    // Altrimenti shape flat (retrocompatibile con la calendar view dell'agenda).
    if (req.query.page || req.query.limit) {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const data = await service.getBookingsPaged(month, page, limit);
      res.json(data);
      return;
    }
    const data = await service.getBookings(month);
    res.json(data);
  });

  getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await service.getStats(req.query.month as string | undefined);
    res.json(data);
  });

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id ?? 'system';
    const data = await service.createBooking(req.body, userId);
    res.status(201).json(data);
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id ?? 'system';
    const data = await service.updateBooking(String(req.params.id), req.body, userId);
    res.json(data);
  });

  getHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await service.getHistory(String(req.params.id));
    res.json(data);
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    await service.deleteBooking(String(req.params.id));
    res.status(204).send();
  });
}
