import { Response } from 'express';
import { BookingService } from '../services/booking.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/async-handler';
import { parsePageQuery } from '../utils/date-utils';
import { parseId } from '../utils/parse-id';

const service = new BookingService();

export class BookingController {
  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { month, page, limit } = parsePageQuery(req.query);
    if (req.query.page || req.query.limit) {
      res.json(await service.getBookingsPaged(month, page, limit));
      return;
    }
    res.json(await service.getBookings(month));
  });

  getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    res.json(await service.getStats(req.query.month as string | undefined));
  });

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id?.toString() ?? 'system';
    res.status(201).json(await service.createBooking(req.body, userId));
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id?.toString() ?? 'system';
    res.json(await service.updateBooking(parseId(req.params.id), req.body, userId));
  });

  getHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    res.json(await service.getHistory(parseId(req.params.id)));
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    await service.deleteBooking(parseId(req.params.id));
    res.status(204).send();
  });

  getAvailable = asyncHandler(async (req: AuthRequest, res: Response) => {
    const date = req.query.date as string;
    if (!date) return res.status(400).json({ message: 'Data obbligatoria' });
    res.json(await service.getAvailableArtists(date));
  });
}
