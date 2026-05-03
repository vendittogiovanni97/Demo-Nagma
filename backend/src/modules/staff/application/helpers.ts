import { parseUTCDate } from '../../../shared/utils/date-utils';

export const SHIFT_LABEL_MAP: Record<string, { startTime: string; endTime: string; isOff: boolean }> = {
  'Mattina':            { startTime: '09:00', endTime: '13:00', isOff: false },
  'Pomeriggio':         { startTime: '14:00', endTime: '19:00', isOff: false },
  'Tutta la giornata':  { startTime: '09:00', endTime: '19:00', isOff: false },
  'Riposo':             { startTime: '',      endTime: '',      isOff: true },
};

export function resolveShiftLabel(label?: string, defaults?: { startTime?: string; endTime?: string; isOff?: boolean }) {
  if (label && label in SHIFT_LABEL_MAP) return SHIFT_LABEL_MAP[label];
  return {
    startTime: defaults?.startTime,
    endTime: defaults?.endTime,
    isOff: defaults?.isOff,
  };
}

export function buildShiftDate(weekStart: string, dayOfWeek: number) {
  const baseDate = parseUTCDate(weekStart);
  const date = new Date(baseDate);
  date.setUTCDate(baseDate.getUTCDate() + dayOfWeek);
  return date;
}
