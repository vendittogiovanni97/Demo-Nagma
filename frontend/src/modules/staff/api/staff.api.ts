import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import type { Staff, CreateStaffData, Shift, CreateShiftData } from '../model/staff.types';
import type { PaginatedResponse } from '@/shared/types/pagination';
import { format, startOfWeek, addDays, parseISO } from 'date-fns';

/**
 * Trasforma i dati grezzi dal backend nel formato atteso dal frontend
 * Backend ritorna: { id, date, startTime, endTime, staffId, staff, ... }
 * Frontend aspetta: { id, staffId, weekStart, dayOfWeek, startTime, endTime, label, isOff, staff }
 */
interface BackendShift {
  id: string;
  date: string;
  startTime?: string;
  endTime?: string;
  staffId: number;
  notes?: string;
  staff?: {
    id: number;
    name: string;
    color?: string;
  };
}

function transformShiftFromBackend(rawShift: BackendShift): Shift {
  const date = new Date(rawShift.date);

  // Calcola weekStart (lunedì della settimana)
  const weekStart = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');

  // Calcola dayOfWeek (0 = lunedì, 6 = domenica)
  const dayOfWeek = date.getUTCDay() === 0 ? 6 : date.getUTCDay() - 1;

  // Determina label e isOff basandosi su startTime e endTime
  const startTime = rawShift.startTime || '';
  const endTime = rawShift.endTime || '';

  let label: string | undefined;
  let isOff = false;

  if (!startTime || !endTime || (startTime === '00:00' && endTime === '00:00')) {
    isOff = true;
    label = 'Riposo';
  } else if (startTime === '09:00' && endTime === '13:00') {
    label = 'Mattina';
  } else if (startTime === '14:00' && endTime === '19:00') {
    label = 'Pomeriggio';
  } else if (startTime === '09:00' && endTime === '19:00') {
    label = 'Tutta la giornata';
  }

  return {
    id: rawShift.id,
    staffId: rawShift.staffId,
    weekStart,
    dayOfWeek,
    startTime,
    endTime,
    label,
    isOff,
    notes: rawShift.notes,
    staff: rawShift.staff ? {
      id: rawShift.staff.id,
      name: rawShift.staff.name,
      color: rawShift.staff.color,
    } : undefined,
  };
}

const LABEL_TO_TIMES: Record<string, { startTime: string; endTime: string }> = {
  'Mattina':          { startTime: '09:00', endTime: '13:00' },
  'Pomeriggio':       { startTime: '14:00', endTime: '19:00' },
  'Tutta la giornata':{ startTime: '09:00', endTime: '19:00' },
  'Riposo':           { startTime: '00:00', endTime: '00:00' },
};

function transformShiftToBackend(data: Partial<CreateShiftData>): Record<string, unknown> {
  const times = data.label
    ? LABEL_TO_TIMES[data.label] ?? { startTime: '09:00', endTime: '13:00' }
    : data.isOff
      ? { startTime: '00:00', endTime: '00:00' }
      : { startTime: data.startTime ?? '09:00', endTime: data.endTime ?? '13:00' };

  const date =
    data.weekStart !== undefined && data.dayOfWeek !== undefined
      ? format(addDays(parseISO(data.weekStart), data.dayOfWeek), 'yyyy-MM-dd')
      : undefined;

  return {
    staffId: data.staffId,
    ...(date ? { date } : {}),
    startTime: times.startTime,
    endTime: times.endTime,
    ...(data.notes ? { notes: data.notes } : {}),
  };
}

export const staffApi = {
  getMembers: async ({
    search,
    type,
    page = 1,
    limit = 20,
  }: {
    search?: string;
    type?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<Staff>> => {
    return apiClient.get<PaginatedResponse<Staff>>(ENDPOINTS.TEAM.MEMBERS, { search, type, page, limit });
  },
  create: async (data: CreateStaffData) => {
    return apiClient.post(ENDPOINTS.TEAM.MEMBERS, data);
  },
  update: async (id: number, data: Partial<CreateStaffData>): Promise<Staff> => {
    return apiClient.put<Staff>(ENDPOINTS.TEAM.MEMBER_BY_ID(id), data);
  },
  delete: async (id: number) => {
    return apiClient.delete(ENDPOINTS.TEAM.MEMBER_BY_ID(id));
  },
  resetMemberPassword: async (id: number, newPassword: string): Promise<void> => {
    return apiClient.put<void>(`${ENDPOINTS.TEAM.MEMBER_BY_ID(id)}/reset-password`, { newPassword });
  },
  getShifts: async (weekStart: string): Promise<Shift[]> => {
    const response = await apiClient.get<unknown>(ENDPOINTS.TEAM.SHIFTS, { weekStart });
    const rawShifts = (Array.isArray(response) ? response : (response as { data?: BackendShift[] })?.data || []) as BackendShift[];
    return rawShifts.map(transformShiftFromBackend);
  },
  createShift: async (data: CreateShiftData) => {
    return apiClient.post(ENDPOINTS.TEAM.SHIFTS, transformShiftToBackend(data));
  },
  updateShift: async (id: string, data: Partial<CreateShiftData>) => {
    return apiClient.put(ENDPOINTS.TEAM.SHIFT_BY_ID(id), transformShiftToBackend(data));
  },
  deleteShift: async (id: string) => {
    return apiClient.delete(ENDPOINTS.TEAM.SHIFT_BY_ID(id));
  },
  getAllForSelect: async (): Promise<Staff[]> => {
    const res = await apiClient.get<PaginatedResponse<Staff>>(ENDPOINTS.TEAM.MEMBERS, { limit: 100 });
    return res.data;
  },
};
