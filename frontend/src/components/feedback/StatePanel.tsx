"use client";

import type { ElementType, ReactNode } from 'react';
import { AlertCircle, Inbox, Loader2 } from 'lucide-react';
import { Box, CircularProgress, keyframes, useTheme } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

type StateVariant = 'loading' | 'empty' | 'error' | 'info';

interface StatePanelProps {
  variant: StateVariant;
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ElementType;
  fullPage?: boolean;
  sx?: SxProps<Theme>;
}

const defaultIcons = {
  loading: Loader2,
  empty: Inbox,
  error: AlertCircle,
  info: Inbox,
} as const;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export default function StatePanel({
  variant,
  title,
  description,
  action,
  icon,
  fullPage = false,
  sx = {},
}: StatePanelProps) {
  const theme = useTheme();
  const Icon = icon ?? defaultIcons[variant];

  const variantConfig = {
    error: {
      bg: 'rgba(244, 67, 54, 0.1)',
      border: 'rgba(244, 67, 54, 0.2)',
      text: '#f44336',
      ringBg: 'rgba(244, 67, 54, 0.1)'
    },
    empty: {
      bg: 'rgba(255, 255, 255, 0.05)',
      border: 'rgba(0, 191, 255, 0.2)',
      text: theme.palette.text.secondary,
      ringBg: 'rgba(0, 191, 255, 0.1)'
    },
    loading: {
      bg: 'rgba(255, 255, 255, 0.05)',
      border: 'rgba(0, 191, 255, 0.2)',
      text: theme.palette.text.secondary,
      ringBg: 'rgba(0, 191, 255, 0.1)'
    },
    info: {
      bg: 'rgba(59, 130, 246, 0.08)',
      border: 'rgba(59, 130, 246, 0.3)',
      text: '#3b82f6',
      ringBg: 'rgba(59, 130, 246, 0.15)',
    },
  };

  const config = variantConfig[variant];

  if (fullPage) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          ...sx
        }}
      >
        <Box sx={{ textAlign: 'center', maxWidth: 320 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
              backgroundColor: config.ringBg
            }}
          >
            {variant === 'loading' ? (
              <CircularProgress size={28} sx={{ color: theme.palette.primary.main }} />
            ) : (
              <Icon size={28} color={config.text} />
            )}
          </Box>
          <Box component="h3" sx={{ fontSize: '1.125rem', fontWeight: 'bold', color: theme.palette.text.primary, mb: 1 }}>
            {title}
          </Box>
          {description && (
            <Box sx={{ fontSize: '0.875rem', color: theme.palette.text.secondary }}>
              {description}
            </Box>
          )}
          {action && <Box sx={{ mt: 2 }}>{action}</Box>}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: 160,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        borderRadius: 3.75,
        border: `1px dashed ${config.border}`,
        backgroundColor: config.bg,
        px: 3,
        py: 5,
        textAlign: 'center',
        ...sx
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 2.5,
          border: `1px solid ${config.border}`,
          backgroundColor: config.ringBg
        }}
      >
        {variant === 'loading' ? (
          <CircularProgress size={22} sx={{ color: theme.palette.primary.main }} />
        ) : (
          <Icon size={22} color={config.text} />
        )}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Box component="p" sx={{ fontSize: '0.875rem', fontWeight: 600, color: theme.palette.text.primary }}>
          {title}
        </Box>
        {description && (
          <Box component="p" sx={{ fontSize: '0.875rem', color: theme.palette.text.secondary }}>
            {description}
          </Box>
        )}
      </Box>
      {action && <Box sx={{ mt: 2 }}>{action}</Box>}
    </Box>
  );
}
