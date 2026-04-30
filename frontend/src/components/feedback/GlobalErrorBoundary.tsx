"use client";

import React from 'react';
import { Box, Stack, Typography, useTheme, SxProps, Theme } from '@mui/material';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import Button from '@/components/ui/Button';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const router = useRouter();
  const theme = useTheme();

  return (
    <Box sx={styles.container}>
      <Box sx={styles.iconWrapper}>
        <AlertCircle size={40} color={theme.palette.error.main} />
      </Box>

      <Typography variant="h3" sx={styles.title}>
        Qualcosa è andato storto
      </Typography>

      <Typography variant="body1" sx={styles.subtitle}>
        Si è verificato un errore inaspettato. Abbiamo notificato il team tecnico. 
        Puoi provare a ricaricare la pagina o tornare alla Dashboard.
      </Typography>

      {process.env.NODE_ENV === 'development' && !!error && (
        <Box component="pre" sx={styles.errorBox}>
          {error instanceof Error ? error.message : String(error)}
        </Box>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} useFlexGap sx={styles.stack}>
        <Button
          variant="primary" size="md"
          onClick={resetErrorBoundary}
          startIcon={<RefreshCw size={18} />}
        >
          Riprova subito
        </Button>

        <Button
          variant="secondary" size="md"
          onClick={() => {
            resetErrorBoundary();
            router.push('/');
          }}
          startIcon={<Home size={18} />}
        >
          Torna alla Home
        </Button>
      </Stack>
    </Box>
  );
}

export default function GlobalErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => {}}>
      {children}
    </ErrorBoundary>
  );
}

const styles = {
  container: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', p: 3, textAlign: 'center',
    animation: 'fadeIn 0.5s ease-in-out',
    '@keyframes fadeIn': {
      from: { opacity: 0, transform: 'translateY(20px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
  } as SxProps<Theme>,
  iconWrapper: {
    width: 80, height: 80, bgcolor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: '50%', display: 'flex', alignItems: 'center',
    justifyContent: 'center', mb: 3, border: '1px solid rgba(244, 67, 54, 0.2)',
  } as SxProps<Theme>,
  title: {
    fontWeight: 700, color: 'text.primary', mb: 1.5,
  } as SxProps<Theme>,
  subtitle: {
    color: 'text.secondary', maxWidth: '600px', mb: 4,
  } as SxProps<Theme>,
  errorBox: {
    bgcolor: 'rgba(244, 67, 54, 0.05)', border: '1px solid rgba(244, 67, 54, 0.1)',
    p: 2, borderRadius: 2, textAlign: 'left', fontSize: '0.75rem',
    color: 'error.light', mb: 4, maxWidth: '800px', overflow: 'auto',
    fontFamily: 'monospace',
  } as SxProps<Theme>,
  stack: {
    gap: 2, alignItems: 'center'
  } as SxProps<Theme>,
};
