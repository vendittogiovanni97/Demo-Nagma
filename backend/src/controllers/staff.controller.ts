import { Request, Response } from 'express';
import { StaffService } from '../services/staff.service';
import { asyncHandler } from '../utils/async-handler';

const service = new StaffService();

export class StaffController {
  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const data = await service.getAll();
    res.json(data);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const data = await service.create(req.body);
    res.status(201).json(data);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await service.delete(String(req.params.id));
    res.status(204).send();
  });
}
