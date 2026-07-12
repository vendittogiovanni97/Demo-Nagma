import type { Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';

/**
 * Stili base condivisi per il blocco MuiOutlinedInput-root.
 * Usare come spread quando si devono aggiungere override interni:
 *   sx={{ '& .MuiOutlinedInput-root': { ...inputRootSx(theme), extraKey: ... } }}
 */
export function inputRootSx(theme: Theme) {
  return {
    backgroundColor: alpha(theme.palette.common.white, 0.05),
    borderRadius: '8px',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease-in-out',
    '& fieldset': { borderColor: theme.palette.divider },
    '&:hover fieldset': { borderColor: theme.palette.primary.main },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 2px ${theme.palette.primary.main}33`,
    },
    '&.Mui-disabled': { opacity: 0.5 },
  } as const;
}

/**
 * sx completo per TextField senza override interni:
 *   sx={inputSx(theme)}
 */
export function inputSx(theme: Theme) {
  return {
    '& .MuiOutlinedInput-root': inputRootSx(theme),
  };
}
