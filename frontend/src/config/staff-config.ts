export const DAYS_OF_WEEK = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'] as const;
export const SHIFT_LABELS = ['Mattina', 'Pomeriggio', 'Tutta la giornata', 'Riposo'] as const;
export type ShiftLabel = typeof SHIFT_LABELS[number];
