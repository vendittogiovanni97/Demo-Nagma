import { Shift, ShiftProps } from '../domain/Shift';

export interface IShiftRepository {
  findById(id: string): Promise<Shift | null>;
  findAll(): Promise<Shift[]>;
  findByStaffId(staffId: number): Promise<Shift[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Shift[]>;
  create(shift: Shift): Promise<Shift>;
  update(id: string, data: Partial<ShiftProps>): Promise<Shift>;
  delete(id: string): Promise<void>;
  hasConflict(staffId: number, date: Date, startTime: string, endTime: string, excludeId?: string): Promise<boolean>;
}
