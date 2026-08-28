"use client";

import { Toaster } from 'react-hot-toast';
import { useTheme, alpha } from '@mui/material/styles';

export function ToastContainer() {
  const theme = useTheme();

  const isLight = theme.palette.mode === 'light';
  const bg = isLight ? alpha(theme.palette.background.paper, 0.95) : alpha(theme.palette.background.paper, 0.88);
  const textColor = theme.palette.text.primary;
  const paperBg = theme.palette.background.paper;

  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        duration: 3500,
        style: {
          background: bg,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          color: textColor,
          borderRadius: '14px',
          padding: '12px 18px',
          fontFamily: '"Outfit", "Avenir Next", sans-serif',
          fontSize: '0.875rem',
          fontWeight: 600,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
          boxShadow: `0 12px 32px ${alpha(theme.palette.common.black, 0.4)}, 0 0 20px ${alpha(theme.palette.primary.main, 0.15)}`,
        },
        success: {
          style: {
            background: bg,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            color: textColor,
            borderRadius: '14px',
            padding: '12px 18px',
            fontFamily: '"Outfit", "Avenir Next", sans-serif',
            fontSize: '0.875rem',
            fontWeight: 600,
            border: `1px solid ${alpha(theme.palette.success.main, 0.35)}`,
            boxShadow: `0 12px 32px ${alpha(theme.palette.common.black, 0.4)}, 0 0 20px ${alpha(theme.palette.success.main, 0.2)}`,
          },
          iconTheme: {
            primary: theme.palette.success.main,
            secondary: paperBg,
          },
        },
        error: {
          duration: 4500,
          style: {
            background: bg,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            color: textColor,
            borderRadius: '14px',
            padding: '12px 18px',
            fontFamily: '"Outfit", "Avenir Next", sans-serif',
            fontSize: '0.875rem',
            fontWeight: 600,
            border: `1px solid ${alpha(theme.palette.error.main, 0.35)}`,
            boxShadow: `0 12px 32px ${alpha(theme.palette.common.black, 0.4)}, 0 0 20px ${alpha(theme.palette.error.main, 0.2)}`,
          },
          iconTheme: {
            primary: theme.palette.error.main,
            secondary: paperBg,
          },
        },
        loading: {
          style: {
            background: bg,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            color: textColor,
            borderRadius: '14px',
            padding: '12px 18px',
            fontFamily: '"Outfit", "Avenir Next", sans-serif',
            fontSize: '0.875rem',
            fontWeight: 600,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.35)}`,
            boxShadow: `0 12px 32px ${alpha(theme.palette.common.black, 0.4)}, 0 0 20px ${alpha(theme.palette.primary.main, 0.2)}`,
          },
          iconTheme: {
            primary: theme.palette.primary.main,
            secondary: paperBg,
          },
        },
      }}
    />
  );
}
