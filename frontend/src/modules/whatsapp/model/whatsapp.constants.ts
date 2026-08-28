import { WHATSAPP_VARIABLE_COLORS } from '@/common/theme/colorTokens';

export interface QuickVariable {
  label: string;
  value: string;
  color?: string;
}

export const WHATSAPP_QUICK_VARIABLES: QuickVariable[] = [
  { label: '👤 Nome Cliente', value: '{{nome}}', color: WHATSAPP_VARIABLE_COLORS[0] },
  { label: '📅 Data Appt.', value: '{{data}}', color: WHATSAPP_VARIABLE_COLORS[1] },
  { label: '⏰ Ora Appt.', value: '{{ora}}', color: WHATSAPP_VARIABLE_COLORS[2] },
  { label: '🎨 Artista', value: '{{artista}}', color: WHATSAPP_VARIABLE_COLORS[3] },
  { label: '💰 Prezzo/Acconto', value: '{{prezzo}}', color: WHATSAPP_VARIABLE_COLORS[4] },
];

export function extractVariables(text: string): string[] {
  if (!text) return [];
  const matches = text.match(/\{\{([^}]+)\}\}/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map((m) => m.replace(/[\{\}]/g, '').trim())));
}
