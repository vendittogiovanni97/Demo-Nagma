import type { Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';

/**
 * Token e helper di stile Glassmorphism condivisi per il design system Demo-Nagma.
 */

export const GLASS_TOKENS = {
  bgLight: 0.03,
  bgMedium: 0.05,
  bgHover: 0.08,
  blurSm: '8px',
  blurMd: '10px',
  blurLg: '20px',
} as const;

export function glassSurfaceSx(
  theme: Theme,
  opacity: number = GLASS_TOKENS.bgLight,
  blur: string = GLASS_TOKENS.blurMd,
) {
  return {
    backgroundColor: alpha(theme.palette.common.white, opacity),
    backdropFilter: `blur(${blur})`,
  } as const;
}
