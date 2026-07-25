import type { Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';

/**
 * Stili base condivisi ultra-premium per MuiOutlinedInput-root.
 */
export function inputRootSx(theme: Theme) {
  const isLight = theme.palette.mode === 'light';
  return {
    color: theme.palette.text.primary,
    '& .MuiInputBase-input': {
      color: theme.palette.text.primary,
      fontFamily: 'Outfit, sans-serif',
      fontSize: '0.875rem',
      fontWeight: 500,
      py: 1.2,
      '&::placeholder': {
        color: theme.palette.text.secondary,
        opacity: 0.7,
      },
    },
    backgroundColor: isLight
      ? alpha(theme.palette.background.paper, 0.85)
      : alpha(theme.palette.common.white, 0.04),
    backdropFilter: 'blur(8px)',
    borderRadius: '12px',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    '& fieldset': {
      borderColor: isLight
        ? alpha(theme.palette.common.black, 0.12)
        : alpha(theme.palette.common.white, 0.12),
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    },
    '&:hover': {
      backgroundColor: isLight
        ? alpha(theme.palette.background.paper, 0.95)
        : alpha(theme.palette.common.white, 0.06),
      '& fieldset': {
        borderColor: alpha(theme.palette.primary.main, 0.5),
      },
    },
    '&.Mui-focused': {
      backgroundColor: isLight
        ? theme.palette.background.paper
        : alpha(theme.palette.common.white, 0.07),
      '& fieldset': {
        borderColor: theme.palette.primary.main,
        borderWidth: '1.5px',
      },
      boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.15)}, 0 4px 12px ${alpha(theme.palette.common.black, 0.08)}`,
    },
    '&.Mui-disabled': {
      opacity: 0.55,
      backgroundColor: isLight
        ? alpha(theme.palette.common.black, 0.02)
        : alpha(theme.palette.common.white, 0.02),
    },
  } as const;
}

/**
 * sx completo per TextField senza override interni
 */
export function inputSx(theme: Theme) {
  return {
    '& .MuiOutlinedInput-root': inputRootSx(theme),
  };
}
