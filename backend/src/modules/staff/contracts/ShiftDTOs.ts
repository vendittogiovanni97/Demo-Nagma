export interface CreateShiftDTO {
  staffId: number;
  date?: Date;
  weekStart?: string;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  label?: string;
  notes?: string;
  isOff?: boolean;
}

export interface UpdateShiftDTO {
  weekStart?: string;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  label?: string;
  notes?: string;
  isOff?: boolean;
}
