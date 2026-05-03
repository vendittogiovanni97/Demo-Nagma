import { Request, Response } from 'express';
import { ListStaff } from '../application/ListStaff';
import { CreateStaff } from '../application/CreateStaff';
import { UpdateStaff } from '../application/UpdateStaff';
import { DeleteStaff } from '../application/DeleteStaff';
import { GetStaffById } from '../application/GetStaffById';
import { ListShifts } from '../application/ListShifts';
import { CreateShift } from '../application/CreateShift';
import { UpdateShift } from '../application/UpdateShift';
import { DeleteShift } from '../application/DeleteShift';
import { GetStaffShifts } from '../application/GetStaffShifts';
import { ResetStaffPassword } from '../application/ResetStaffPassword';
import { validate } from '../../../shared/utils/validation';
import { createStaffSchema, updateStaffSchema, createShiftSchema, updateShiftSchema, resetPasswordSchema } from './staff.schemas';
import { parsePageQuery } from '../../../shared/utils/date-utils';
import { parseId } from '../../../shared/utils/parse-id';
import { AppError } from '../../../shared/errors/AppError';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

export class StaffController {
  constructor(
    private listStaffUseCase: ListStaff,
    private createStaffUseCase: CreateStaff,
    private updateStaffUseCase: UpdateStaff,
    private deleteStaffUseCase: DeleteStaff,
    private getStaffByIdUseCase: GetStaffById,
    private listShiftsUseCase: ListShifts,
    private createShiftUseCase: CreateShift,
    private updateShiftUseCase: UpdateShift,
    private deleteShiftUseCase: DeleteShift,
    private getStaffShiftsUseCase: GetStaffShifts,
    private resetStaffPasswordUseCase: ResetStaffPassword
  ) {}

  getMembers = asyncHandler(async (req: Request, res: Response) => {
    const { search, page, limit } = parsePageQuery(req.query);
    const type = req.query.type as string | undefined;
    const result = await this.listStaffUseCase.execute({ search, type, page, limit });
    res.json(result);
  });

  getMembersForSelect = asyncHandler(async (_req: Request, res: Response) => {
    const result = await this.listStaffUseCase.executeAll();
    res.json(result.map(s => s.toJSON()));
  });

  getMemberById = asyncHandler(async (req: Request, res: Response) => {
    const member = await this.getStaffByIdUseCase.execute(parseId(req.params.id));
    if (!member) throw new AppError('Membro non trovato', 404, 'NOT_FOUND');
    res.json(member.toJSON());
  });

  createMember = asyncHandler(async (req: Request, res: Response) => {
    const data = validate(createStaffSchema, req.body);
    const result = await this.createStaffUseCase.execute(data as any);
    res.status(201).json(result.toJSON());
  });

  updateMember = asyncHandler(async (req: Request, res: Response) => {
    const data = validate(updateStaffSchema, req.body);
    const result = await this.updateStaffUseCase.execute(parseId(req.params.id), data as any);
    res.json(result.toJSON());
  });

  deleteMember = asyncHandler(async (req: Request, res: Response) => {
    await this.deleteStaffUseCase.execute(parseId(req.params.id));
    res.status(204).send();
  });

  getAllShifts = asyncHandler(async (req: Request, res: Response) => {
    const weekStart = req.query.weekStart as string | undefined;
    const shifts = await this.listShiftsUseCase.execute(weekStart);
    res.json({ data: shifts.map(s => s.toJSON()) });
  });

  getStaffShifts = asyncHandler(async (req: Request, res: Response) => {
    const staffId = parseId(req.params.staffId);
    const shifts = await this.getStaffShiftsUseCase.execute(staffId);
    res.json({ data: shifts.map(s => s.toJSON()) });
  });

  createNewShift = asyncHandler(async (req: Request, res: Response) => {
    const data = validate(createShiftSchema, req.body);
    const result = await this.createShiftUseCase.execute(data as any);
    res.status(201).json({ data: result.toJSON() });
  });

  updateExistingShift = asyncHandler(async (req: Request, res: Response) => {
    const data = validate(updateShiftSchema, req.body);
    const result = await this.updateShiftUseCase.execute(req.params.id as string, data as any);
    res.json(result.toJSON());
  });

  deleteExistingShift = asyncHandler(async (req: Request, res: Response) => {
    await this.deleteShiftUseCase.execute(req.params.id as string);
    res.status(204).send();
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const data = validate(resetPasswordSchema, req.body);
    await this.resetStaffPasswordUseCase.execute(parseId(req.params.id), data);
    res.json({ message: 'Password aggiornata con successo.' });
  });
}
