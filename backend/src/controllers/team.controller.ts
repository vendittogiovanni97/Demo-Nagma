import { Request, Response } from 'express';
import { TeamService } from '../services/team.service';
import { asyncHandler } from '../utils/async-handler';
import { parsePageQuery } from '../utils/date-utils';
import { AppError } from '../utils/AppError';
import { parseId } from '../utils/parse-id';

const service = new TeamService();

export class TeamController {
  getUsers = asyncHandler(async (req: Request, res: Response) => {
    const { search, page, limit } = parsePageQuery(req.query);
    res.json(await service.getAllUsers(search, req.query.type as string | undefined, page, limit));
  });

  createUser = asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(await service.createUser(req.body));
  });

  createShift = asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json(await service.createShift(req.body));
  });

  updateShift = asyncHandler(async (req: Request, res: Response) => {
    res.json(await service.updateShift(String(req.params.id), req.body));
  });

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    await service.deleteUser(parseId(req.params.id));
    res.status(204).send();
  });

  deleteShift = asyncHandler(async (req: Request, res: Response) => {
    await service.deleteShift(String(req.params.id));
    res.status(204).send();
  });

  updateUser = asyncHandler(async (req: Request, res: Response) => {
    res.json(await service.updateUser(parseId(req.params.id), req.body));
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    await service.resetPassword(parseId(req.params.id), req.body);
    res.json({ message: 'Password aggiornata con successo.' });
  });

  /**
   * GET /api/team/shifts?weekStart=YYYY-MM-DD
   * Restituisce gli shift della settimana specificata (o tutti se weekStart non fornito)
   */
  getAllShifts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const weekStart = req.query.weekStart as string | undefined;
    const shifts = weekStart
      ? await service.getShifts(weekStart)
      : await service.findAllShifts();
    res.json({ data: shifts });
  });

  /**
   * GET /api/team/shifts/:staffId
   * Restituisce gli shift per uno specifico staff
   */
  getStaffShifts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const staffId = Array.isArray(req.params.staffId) ? req.params.staffId[0] : req.params.staffId;

      if (!staffId) {
        throw new AppError('staffId è obbligatorio', 400);
      }

      const shifts = await service.getStaffShifts(staffId);
      res.json({ data: shifts });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Errore nel recupero degli shift dello staff', 500);
    }
  });

  /**
   * POST /api/team/shifts
   * Crea un nuovo shift con verifica di conflitti orari
   */
  createNewShift = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { date, startTime, endTime, breakDuration, notes, staffId } = req.body;

      if (!date || !startTime || !endTime || !staffId) {
        throw new AppError('I campi date, startTime, endTime e staffId sono obbligatori', 400);
      }

      const shift = await service.createShiftWithConflictCheck({
        date: new Date(date),
        startTime,
        endTime,
        breakDuration: breakDuration ? parseInt(breakDuration, 10) : undefined,
        notes,
        staffId: Number(staffId),
      });

      res.status(201).json({ data: shift });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Errore nella creazione dello shift', 500);
    }
  });

  /**
   * GET /api/team/members/:id
   * Restituisce un singolo membro del team per ID
   */
  getMemberById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req.params.id);
    const member = await service.findMemberById(id);
    if (!member) throw new AppError('Membro non trovato', 404, 'NOT_FOUND');
    res.json(member);
  });

  /**
   * DELETE /api/team/shifts/:id
   * Elimina uno shift per ID
   */
  deleteShiftById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      if (!id) {
        throw new AppError('id è obbligatorio', 400);
      }

      await service.deleteShiftById(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Errore nell\'eliminazione dello shift', 500);
    }
  });
}
