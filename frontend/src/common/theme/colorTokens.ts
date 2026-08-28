/**
 * colorTokens.ts — Colori "di dato" centralizzati del design system.
 *
 * Distinzione rispetto ai token MUI (`theme.palette.*`):
 * - In questo file vivono SOLO colori che rappresentano **dati** o **stati**, non
 *   colori di superficie/bordo/ombra dei componenti (quelli usano il tema MUI
 *   tramite `theme.palette.*` e `alpha(...)`).
 * - Centralizzarli qui rende il rebranding un'operazione in un unico punto e
 *   mantiene il resto del codice libero da esadecimali/`rgba` hardcoded
 *   (regola AGENTS.md).
 */

/** Colore brand primario di default (usato quando la ClientConfig non è attiva). */
export const DEFAULT_PRIMARY_COLOR = '#00bfff';

/** Colore brand secondario di default (usato quando la ClientConfig non è attiva). */
export const DEFAULT_SECONDARY_COLOR = '#1a2332';

/** Colore del meta `theme-color` del browser (barra mobile). */
export const BROWSER_THEME_COLOR = '#0F172A';

/** Fallback unico per il colore di un artista quando non valorizzato (dato dal backend). */
export const DEFAULT_ARTIST_COLOR = '#00bfff';

/** Colori di stato delle colonne kanban (il colore è un dato di stage, non un token di superficie). */
export const KANBAN_STAGE_COLORS = {
  IN_ARRIVO: '#00e5ff',
  IN_ATTESA: '#ab47bc',
  IN_SEDUTA: '#29b6f6',
  DA_SALDARE: '#ffa726',
  SALDATO: '#66bb6a',
} as const;

/** Colori disponibili per la personalizzazione del colore di uno staff member. */
export const STAFF_COLOR_PRESETS = [
  '#00BFFF',
  '#4F7CFF',
  '#25D366',
  '#FF6B6B',
  '#FFB020',
  '#9B6DFF',
] as const;

/** Colori utilizzati per evidenziare le variabili rapide nell'editor WhatsApp. */
export const WHATSAPP_VARIABLE_COLORS = [
  '#00e5ff',
  '#ff007f',
  '#7000ff',
  '#ffaa00',
  '#00ff66',
] as const;