import { Request, Response } from 'express';
import { createStaffSchema, validate } from '../schemas';
import { StaffService } from '../services/staff.service';
import { asyncHandler } from '../utils/async-handler';
import { parseId } from '../utils/parse-id';

const staffService = new StaffService();

export class StaffController {
  getAll = asyncHandler(async (_req: Request, res: Response) => {
    res.json(await staffService.findAll());
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const data = validate(createStaffSchema, req.body);
    res.status(201).json(await staffService.create(data));
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await staffService.delete(parseId(req.params.id));
    res.status(204).send();
  });
}
