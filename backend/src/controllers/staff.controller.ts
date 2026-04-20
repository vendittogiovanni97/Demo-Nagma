import { Request, Response } from 'express';
import { StaffRepository } from '../repositories/staff.repository';
import { validate, createStaffSchema } from '../schemas';
import { asyncHandler } from '../utils/async-handler';
import { parseId } from '../utils/parse-id';

const repo = new StaffRepository();

export class StaffController {
  getAll = asyncHandler(async (_req: Request, res: Response) => {
    res.json(await repo.findAll());
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const data = validate(createStaffSchema, req.body);
    res.status(201).json(await repo.create(data));
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await repo.delete(parseId(req.params.id));
    res.status(204).send();
  });
}
