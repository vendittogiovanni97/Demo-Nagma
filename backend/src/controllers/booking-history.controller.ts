import { Response } from 'express';
import { BookingHistoryService } from '../services/booking-history.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/async-handler';
import { BookingAction } from '@prisma/client';

const service = new BookingHistoryService();

export class BookingHistoryController {
  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;

    const filters = {
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      action: req.query.action as BookingAction | undefined,
      userId: req.query.userId ? Number(req.query.userId) : undefined,
    };

    res.json(await service.getHistoryPaged(page, limit, filters));
  });
}