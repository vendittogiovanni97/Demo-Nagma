export interface QuickVariable {
  label: string;
  value: string;
  color?: string;
}

export const WHATSAPP_QUICK_VARIABLES: QuickVariable[] = [
  { label: '👤 Nome Cliente', value: '{{nome}}', color: '#00e5ff' },
  { label: '📅 Data Appt.', value: '{{data}}', color: '#ff007f' },
  { label: '⏰ Ora Appt.', value: '{{ora}}', color: '#7000ff' },
  { label: '🎨 Artista', value: '{{artista}}', color: '#ffaa00' },
  { label: '💰 Prezzo/Acconto', value: '{{prezzo}}', color: '#00ff66' },
];

export function extractVariables(text: string): string[] {
  if (!text) return [];
  const matches = text.match(/\{\{([^}]+)\}\}/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map((m) => m.replace(/[\{\}]/g, '').trim())));
}
