"use client";

import Link from 'next/link';
import { Box, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

export default function NotFound() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 32,
          left: 32,
        }}
      >
        <Link
          href="/"
          style={{
            color: alpha(theme.palette.common.white, 0.4),
            transition: 'color 0.3s',
          }}
        >
          <Typography
            component="span"
            sx={{
              fontFamily: 'var(--font-outfit)',
              fontWeight: 700,
              letterSpacing: '0.2em',
              fontSize: '1.125rem',
            }}
          >
            NAGMA
          </Typography>
        </Link>
      </Box>

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <Typography
          sx={{
            color: alpha(theme.palette.common.white, 0.1),
            fontFamily: 'serif',
            fontSize: '25rem',
            lineHeight: 1,
            fontWeight: 700,
            userSelect: 'none',
          }}
        >
          404
        </Typography>
      </Box>

      <Box
        sx={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          px: 2,
          maxWidth: 360,
          textAlign: 'center',
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 700, color: 'white' }}>
          Pagina non trovata
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          La pagina che cerchi non esiste o è stata spostata.
        </Typography>

        <Link
          href="/"
          style={{
            marginTop: 16,
            padding: '12px 32px',
            borderRadius: 8,
            border: `1px solid ${theme.palette.primary.main}`,
            color: theme.palette.primary.main,
            fontWeight: 500,
            transition: 'all 0.3s ease-out',
            textDecoration: 'none',
          }}
        >
          Torna alla home
        </Link>
      </Box>
    </Box>
  );
}
