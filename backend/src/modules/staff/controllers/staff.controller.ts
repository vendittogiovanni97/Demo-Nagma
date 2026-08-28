import { Request, Response } from 'express';
import { AuthRequest } from '../../../core/middleware/auth.middleware';
import { handleSearch, handleGetById, handleCreate, handleUpdate, handleDelete } from '../../../core/utils/handler';
import { asyncHandler } from '../../../core/shared/utils/asyncHandler';
import { validate } from '../../../core/shared/utils/validation';
import { parseId } from '../../../core/shared/utils/parse-id';
import { parsePageQuery } from '../../../core/shared/utils/date-utils';
import { StaffService } from '../services/staffService';
import {
  createStaffSchema,
  updateStaffSchema,
  createShiftSchema,
  updateShiftSchema,
  resetPasswordSchema,
} from './staff.schemas';

export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  getMembers = handleSearch(async (query) => {
    const { search, page, limit } = parsePageQuery(query);
    const type = query.type as string | undefined;
    return this.staffService.searchMembers({ search, type, page, limit });
  });

  getMembersForSelect = asyncHandler(async (_req: Request, res: Response) => {
    const result = await this.staffService.listAllMembers();
    res.json(result);
  });

  getMemberById = handleGetById(async (id) => {
    return this.staffService.getMemberById(id);
  }, 'Membro non trovato.');

  createMember = handleCreate(async (data) => {
    return this.staffService.createMember(data);
  }, createStaffSchema);

  updateMember = handleUpdate(async (id, data) => {
    return this.staffService.updateMember(id, data);
  }, updateStaffSchema);

  deleteMember = handleDelete(async (id) => this.staffService.deleteMember(id));

  resetPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = validate(resetPasswordSchema, req.body);
    await this.staffService.resetPassword(parseId(req.params.id), data);
    res.json({ message: 'Password aggiornata con successo.' });
  });

  getAllShifts = asyncHandler(async (req: Request, res: Response) => {
    const weekStart = req.query.weekStart as string | undefined;
    const shifts = await this.staffService.listShifts(weekStart);
    res.json({ data: shifts });
  });

  getStaffShifts = asyncHandler(async (req: Request, res: Response) => {
    const staffId = parseId(req.params.staffId);
    const shifts = await this.staffService.getStaffShifts(staffId);
    res.json({ data: shifts });
  });

  createNewShift = asyncHandler(async (req: Request, res: Response) => {
    const data = validate(createShiftSchema, req.body);
    const result = await this.staffService.createShift(data);
    res.status(201).json({ data: result });
  });

  updateExistingShift = asyncHandler(async (req: Request, res: Response) => {
    const data = validate(updateShiftSchema, req.body);
    const result = await this.staffService.updateShift(req.params.id as string, data);
    res.json(result);
  });

  deleteExistingShift = asyncHandler(async (req: Request, res: Response) => {
    await this.staffService.deleteShift(req.params.id as string);
    res.status(204).send();
  });
}
