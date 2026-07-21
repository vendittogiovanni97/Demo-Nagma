"use client";

import React, { ElementType, ReactNode } from 'react';
import { alpha } from '@mui/material/styles';
import Icon from '@/common/components/ui/Icon';
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

const defaultIcons: Record<string, ElementType> = {
  loading: (props: any) => <Icon name="loader2" {...props} />,
  empty: (props: any) => <Icon name="inbox" {...props} />,
  error: (props: any) => <Icon name="alertCircle" {...props} />,
  info: (props: any) => <Icon name="inbox" {...props} />,
};

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

  const isLight = theme.palette.mode === 'light';

  const variantConfig = {
    error: {
      bg: alpha(theme.palette.error.main, 0.1),
      border: alpha(theme.palette.error.main, 0.2),
      text: theme.palette.error.main,
      ringBg: alpha(theme.palette.error.main, 0.1)
    },
    empty: {
      bg: isLight ? alpha(theme.palette.primary.main, 0.04) : alpha(theme.palette.common.white, 0.05),
      border: alpha(theme.palette.primary.main, 0.2),
      text: theme.palette.text.secondary,
      ringBg: alpha(theme.palette.primary.main, 0.1)
    },
    loading: {
      bg: isLight ? alpha(theme.palette.primary.main, 0.04) : alpha(theme.palette.common.white, 0.05),
      border: alpha(theme.palette.primary.main, 0.2),
      text: theme.palette.text.secondary,
      ringBg: alpha(theme.palette.primary.main, 0.1)
    },
    info: {
      bg: alpha(theme.palette.info.main, 0.08),
      border: alpha(theme.palette.info.main, 0.3),
      text: theme.palette.info.main,
      ringBg: alpha(theme.palette.info.main, 0.15),
    },
  };

  const config = variantConfig[variant];

  if (fullPage) {
    return (
      <Box sx={[styles.fullPageContainer(theme), ...(Array.isArray(sx) ? sx : [sx])] as any}>
        <Box sx={styles.fullPageContent}>
          <Box sx={[styles.iconWrapperLarge(theme), { backgroundColor: config.ringBg }] as any}>
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
  fullPageContainer: (theme: Theme) => ({
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3,
    background: `radial-gradient(circle at 50% 50%, ${alpha(theme.palette.primary.main, 0.03)} 0%, transparent 70%)`
  }),
  fullPageContent: {
    textAlign: 'center', maxWidth: 360, position: 'relative'
  } as SxProps<Theme>,
  iconWrapperLarge: (theme: Theme) => ({
    width: 80, height: 80, borderRadius: '50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3,
    boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.1)}`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
  }),
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
    boxShadow: (theme: Theme) => `0 4px 12px ${alpha(theme.palette.common.black, 0.2)}`
  } as SxProps<Theme>,
  textGroup: {
    display: 'flex', flexDirection: 'column', gap: 0.75, maxWidth: 300
  } as SxProps<Theme>,
  titleSmall: {
    fontSize: '1rem', fontWeight: 700, color: 'text.primary',
    fontFamily: 'Outfit, sans-serif'
  } as SxProps<Theme>,
};
