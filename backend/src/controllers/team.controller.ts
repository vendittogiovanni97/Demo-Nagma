import { Request, Response } from 'express';
import { TeamService } from '../services/team.service';
import { asyncHandler } from '../utils/async-handler';

const service = new TeamService();

export class TeamController {
  getUsers = asyncHandler(async (req: Request, res: Response) => {
    const data = await service.getAllUsers(
      req.query.search as string | undefined,
      req.query.role as string | undefined,
      req.query.page ? Number(req.query.page) : 1,
      req.query.limit ? Number(req.query.limit) : 20
    );
    res.json(data);
  });

  createUser = asyncHandler(async (req: Request, res: Response) => {
    const data = await service.createUser(req.body);
    res.status(201).json(data);
  });

  getShifts = asyncHandler(async (req: Request, res: Response) => {
    const data = await service.getShifts(req.query.weekStart as string | undefined);
    res.json(data);
  });

  createShift = asyncHandler(async (req: Request, res: Response) => {
    const data = await service.createShift(req.body);
    res.status(201).json(data);
  });

  updateShift = asyncHandler(async (req: Request, res: Response) => {
    const data = await service.updateShift(String(req.params.id), req.body);
    res.json(data);
  });

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    await service.deleteUser(String(req.params.id));
    res.status(204).send();
  });

  deleteShift = asyncHandler(async (req: Request, res: Response) => {
    await service.deleteShift(String(req.params.id));
    res.status(204).send();
  });
}
