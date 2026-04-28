import { Response } from 'express';
import { BookingService } from '../services/booking.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/async-handler';
import { parsePageQuery } from '../utils/date-utils';
import { parseId } from '../utils/parse-id';
import { exportFiltersSchema, buildFiltersLabel } from '../utils/export-filters';
import { AppError } from '../utils/AppError';
import { validate, verifyPasswordSchema } from '../schemas';

const service = new BookingService();

export class BookingController {
  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { month, page, limit } = parsePageQuery(req.query);
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    if (req.query.page || req.query.limit) {
      res.json(await service.getBookingsPaged(month, page, limit, startDate, endDate));
      return;
    }
    res.json(await service.getBookings(month, startDate, endDate));
  });

  getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    res.json(await service.getStats(req.query.month as string | undefined));
  });

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    res.status(201).json(await service.createBooking(req.body, userId));
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    res.json(await service.updateBooking(parseId(req.params.id), req.body, userId, req.user?.role));
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

  verifyPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { password } = validate(verifyPasswordSchema, req.body);
    await service.verifyPassword(password);
    res.json({ message: 'Password corretta' });
  });

  export = asyncHandler(async (req: AuthRequest, res: Response) => {
    // Supporta sia query params che body per i filtri
    const filters = req.body?.filters ?? req.query;

    // Valida i filtri
    let validatedFilters;
    try {
      validatedFilters = exportFiltersSchema.parse(filters);
    } catch (error) {
      throw new AppError('Parametri filtro non validi', 400, 'INVALID_FILTERS', { error });
    }

    // Recupera i dati filtrati
    const bookings = await service.getBookingsForExport(validatedFilters);

    // Crea la label dei filtri
    const filtersLabel = buildFiltersLabel(validatedFilters);

    res.json({
      data: bookings,
      count: bookings.length,
      filters: validatedFilters,
      filtersLabel,
    });
  });
}
