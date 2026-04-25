'use client';

import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { Box, Typography, Stack, useTheme } from '@mui/material';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const router = useRouter();
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        textAlign: 'center',
        animation: 'fadeIn 0.5s ease-in-out',
        '@keyframes fadeIn': {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          border: '1px solid rgba(244, 67, 54, 0.2)',
        }}
      >
        <AlertCircle size={40} color={theme.palette.error.main} />
      </Box>

      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
          color: theme.palette.text.primary,
          mb: 1.5,
        }}
      >
        Qualcosa è andato storto
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: theme.palette.text.secondary,
          maxWidth: 'md',
          mb: 4,
        }}
      >
        Si è verificato un errore inaspettato. Abbiamo notificato il team tecnico. Puoi provare a ricaricare la pagina o tornare alla Dashboard.
      </Typography>

      {process.env.NODE_ENV === 'development' && !!error && (
        <Box
          component="pre"
          sx={{
            backgroundColor: 'rgba(244, 67, 54, 0.05)',
            border: '1px solid rgba(244, 67, 54, 0.1)',
            p: 2,
            borderRadius: 2,
            textAlign: 'left',
            fontSize: '0.75rem',
            color: theme.palette.error.light,
            mb: 4,
            maxWidth: '2xl',
            overflow: 'auto',
            fontFamily: 'monospace',
          }}
        >
          {error instanceof Error ? error.message : String(error)}
        </Box>
      )}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        useFlexGap
        sx={{ gap: 2, alignItems: 'center' }}
      >
        <Button
          variant="primary"
          size="md"
          onClick={resetErrorBoundary}
          startIcon={<RefreshCw size={18} />}
        >
          Riprova subito
        </Button>

        <Button
          variant="secondary"
          size="md"
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
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {}}
    >
      {children}
    </ErrorBoundary>
  );
}
