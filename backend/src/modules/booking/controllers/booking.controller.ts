import { Response } from 'express';
import { AuthRequest } from '../../../core/middleware/auth.middleware';
import { BookingService } from '../services/bookingService';
import { handleCreate, handleUpdate, handleDelete } from '../../../core/utils/handler';
import { validate } from '../../../core/shared/utils/validation';
import { verifyPasswordSchema } from './booking.schemas';
import { parsePageQuery } from '../../../core/shared/utils/date-utils';
import { parseId } from '../../../core/shared/utils/parse-id';
import { asyncHandler } from '../../../core/shared/utils/asyncHandler';

export class BookingController {
  constructor(private bookingService: BookingService) {}

  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { month, page, limit } = parsePageQuery(req.query);
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const customLimit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : undefined;

    const result = await this.bookingService.findAll({
      month,
      page: (req.query.page || (req.query.limit && !req.query.offset)) ? page : undefined,
      limit: customLimit || limit,
      offset,
      startDate,
      endDate
    });

    res.json(result);
  });

  getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    res.json(await this.bookingService.findStats(req.query.month as string | undefined));
  });

  create = handleCreate(async (data, userId) => this.bookingService.create(data, userId));

  update = handleUpdate(async (id, data, userId) => this.bookingService.update(id, data, userId));

  getHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.bookingService.findHistory(parseId(req.params.id));
    res.json(result);
  });

  getAllHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;

    const filters = {
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      action: req.query.action as any,
      userId: req.query.userId ? Number(req.query.userId) : undefined,
      artistId: req.query.artistId ? Number(req.query.artistId) : undefined,
      search: req.query.search as string | undefined,
    };

    const result = await this.bookingService.findAllHistory(page, limit, filters);
    res.json(result);
  });

  delete = handleDelete(async (id, userId) => this.bookingService.delete(id, userId));

  annul = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    await this.bookingService.annul(parseId(req.params.id), userId);
    res.status(204).send();
  });

  getAvailable = asyncHandler(async (req: AuthRequest, res: Response) => {
    const date = req.query.date as string;
    if (!date) return res.status(400).json({ message: 'Data obbligatoria' });
    res.json(await this.bookingService.findAvailableArtists(date));
  });

  verifyPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { password } = validate(verifyPasswordSchema, req.body);
    await this.bookingService.verifyPassword(password);
    res.json({ message: 'Password corretta' });
  });
}
