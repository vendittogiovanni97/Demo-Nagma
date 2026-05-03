import { Response } from 'express';
import { AuthRequest } from '../../../middlewares/auth.middleware';
import { CreateBooking } from '../application/CreateBooking';
import { UpdateBooking } from '../application/UpdateBooking';
import { ListBookings } from '../application/ListBookings';
import { GetBookingStats } from '../application/GetBookingStats';
import { GetBookingHistory } from '../application/GetBookingHistory';
import { ListBookingHistory } from '../application/ListBookingHistory';
import { GetAvailableArtists } from '../application/GetAvailableArtists';
import { VerifyBookingPassword } from '../application/VerifyBookingPassword';
import { DeleteBooking } from '../application/DeleteBooking';
import { AnnulBooking } from '../application/AnnulBooking';
import { validate } from '../../../shared/utils/validation';
import { verifyPasswordSchema } from './booking.schemas';
import { parsePageQuery } from '../../../shared/utils/date-utils';
import { parseId } from '../../../shared/utils/parse-id';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

export class BookingController {
  constructor(
    private listBookings: ListBookings,
    private createBooking: CreateBooking,
    private updateBooking: UpdateBooking,
    private deleteBooking: DeleteBooking,
    private annulBooking: AnnulBooking,
    private getBookingStats: GetBookingStats,
    private getBookingHistory: GetBookingHistory,
    private listBookingHistory: ListBookingHistory,
    private getAvailableArtists: GetAvailableArtists,
    private verifyBookingPassword: VerifyBookingPassword
  ) {}

  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { month, page, limit } = parsePageQuery(req.query);
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const customLimit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : undefined;

    const result = await this.listBookings.execute({
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
    res.json(await this.getBookingStats.execute(req.query.month as string | undefined));
  });

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    res.status(201).json(await this.createBooking.execute(req.body, userId));
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    res.json(await this.updateBooking.execute(parseId(req.params.id), req.body, userId));
  });

  getHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.getBookingHistory.execute(parseId(req.params.id));
    res.json(result.map(h => h.toJSON()));
  });

  getAllHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;

    const filters = {
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      action: req.query.action as any,
      userId: req.query.userId ? Number(req.query.userId) : undefined,
    };

    const result = await this.listBookingHistory.execute(page, limit, filters);
    res.json({
      ...result,
      data: result.data.map(h => h.toJSON())
    });
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    await this.deleteBooking.execute(parseId(req.params.id), userId);
    res.status(204).send();
  });

  annul = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    await this.annulBooking.execute(parseId(req.params.id), userId);
    res.status(204).send();
  });

  getAvailable = asyncHandler(async (req: AuthRequest, res: Response) => {
    const date = req.query.date as string;
    if (!date) return res.status(400).json({ message: 'Data obbligatoria' });
    res.json(await this.getAvailableArtists.execute(date));
  });

  verifyPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { password } = validate(verifyPasswordSchema, req.body);
    await this.verifyBookingPassword.execute(password);
    res.json({ message: 'Password corretta' });
  });
}
