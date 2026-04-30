"use client";

import React, { ElementType, ReactNode } from 'react';
import { AlertCircle, Inbox, Loader2 } from 'lucide-react';
import { Box, CircularProgress, useTheme, SxProps, Theme } from '@mui/material';

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
      text: theme.palette.error.main,
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
      <Box sx={[styles.fullPageContainer, ...(Array.isArray(sx) ? sx : [sx])] as any}>
        <Box sx={styles.fullPageContent}>
          <Box sx={[styles.iconWrapperLarge, { backgroundColor: config.ringBg }] as any}>
            {variant === 'loading' ? (
              <CircularProgress size={28} sx={{ color: theme.palette.primary.main }} />
            ) : (
              <Icon size={28} color={config.text} />
            )}
          </Box>
          <Box component="h3" sx={styles.titleLarge}>
            {title}
          </Box>
          {description && (
            <Box sx={styles.description}>
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
      sx={[
        styles.panelContainer,
        {
          border: `1px dashed ${config.border}`,
          backgroundColor: config.bg,
        },
        ...(Array.isArray(sx) ? sx : [sx])
      ] as any}
    >
      <Box
        sx={[
          styles.iconWrapperSmall,
          {
            border: `1px solid ${config.border}`,
            backgroundColor: config.ringBg
          }
        ] as any}
      >
        {variant === 'loading' ? (
          <CircularProgress size={22} sx={{ color: theme.palette.primary.main }} />
        ) : (
          <Icon size={22} color={config.text} />
        )}
      </Box>
      <Box sx={styles.textGroup}>
        <Box component="p" sx={styles.titleSmall}>
          {title}
        </Box>
        {description && (
          <Box component="p" sx={styles.description}>
            {description}
          </Box>
        )}
      </Box>
      {action && <Box sx={{ mt: 2 }}>{action}</Box>}
    </Box>
  );
}

const styles = {
  fullPageContainer: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3,
    background: 'radial-gradient(circle at 50% 50%, rgba(0, 191, 255, 0.03) 0%, transparent 70%)'
  } as SxProps<Theme>,
  fullPageContent: {
    textAlign: 'center', maxWidth: 360, position: 'relative'
  } as SxProps<Theme>,
  iconWrapperLarge: {
    width: 80, height: 80, borderRadius: '50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3,
    boxShadow: '0 0 20px rgba(0, 191, 255, 0.1)',
    border: '1px solid rgba(0, 191, 255, 0.1)'
  } as SxProps<Theme>,
  titleLarge: {
    fontSize: '1.25rem', fontWeight: 800, color: 'text.primary', mb: 1,
    fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em'
  } as SxProps<Theme>,
  description: {
    fontSize: '0.9375rem', color: 'text.secondary', lineHeight: 1.6
  } as SxProps<Theme>,
  panelContainer: {
    display: 'flex', minHeight: 200, flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: 2, borderRadius: 4, px: 3, py: 6, textAlign: 'center',
    position: 'relative', overflow: 'hidden',
    transition: 'all 0.3s ease',
    '&::before': {
      content: '""', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      background: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'0 0 20 20\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.02\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1\'/%3E%3C/g%3E%3C/svg%3E")',
      pointerEvents: 'none'
    }
  } as SxProps<Theme>,
  iconWrapperSmall: {
    width: 56, height: 56, display: 'flex', alignItems: 'center',
    justifyContent: 'center', borderRadius: 2.5, mb: 1,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
  } as SxProps<Theme>,
  textGroup: {
    display: 'flex', flexDirection: 'column', gap: 0.75, maxWidth: 300
  } as SxProps<Theme>,
  titleSmall: {
    fontSize: '1rem', fontWeight: 700, color: 'text.primary',
    fontFamily: 'Outfit, sans-serif'
  } as SxProps<Theme>,
};
