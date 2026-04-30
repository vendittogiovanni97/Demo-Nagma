"use client";

import { Box, Stack, Typography, useTheme as useMuiTheme } from '@mui/material';
import { useTheme as useCustomTheme } from '@/context/ThemeContext';
import type { ReactNode } from 'react';
import PermissionGate from '@/components/auth/PermissionGate';
import Button from '@/components/ui/Button';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Primary action button (e.g. "Nuova Prenotazione") */
  buttonLabel?: string;
  buttonIcon?: ReactNode;
  onButtonClick?: () => void;
  buttonRequiresAdmin?: boolean;
  showButton?: boolean;
  /** Secondary action button */
  secondaryButtonLabel?: string;
  secondaryButtonIcon?: ReactNode;
  onSecondaryButtonClick?: () => void;
  secondaryButtonRequiresAdmin?: boolean;
  showSecondaryButton?: boolean;
  /** Custom filter bar (usually SmartFilters) */
  filters?: ReactNode;
  /** Other actions like Export, etc. */
  actions?: ReactNode;
  /** Legacy support or extra content */
  children?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  buttonLabel,
  buttonIcon,
  onButtonClick,
  buttonRequiresAdmin = false,
  showButton = false,
  secondaryButtonLabel,
  secondaryButtonIcon,
  onSecondaryButtonClick,
  secondaryButtonRequiresAdmin = false,
  showSecondaryButton = false,
  filters,
  actions,
  children,
}: PageHeaderProps) {
  const { isXLarge, isLarge } = useCustomTheme();
  const muiTheme = useMuiTheme();

  const primaryBtn = showButton && buttonLabel ? (
    <Button
      variant="primary"
      icon={buttonIcon}
      onClick={onButtonClick}
      size="sm"
      sx={{ flexShrink: 0 }}
    >
      {buttonLabel}
    </Button>
  ) : null;

  const secondaryBtn = showSecondaryButton && secondaryButtonLabel ? (
    <Button
      variant="secondary"
      icon={secondaryButtonIcon}
      onClick={onSecondaryButtonClick}
      size="sm"
      sx={{ flexShrink: 0 }}
    >
      {secondaryButtonLabel}
    </Button>
  ) : null;

  // Use a more compact layout on Large/XLarge screens (Laptop/Monitor)
  const isDesktop = isLarge || isXLarge;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isDesktop ? 'row' : 'column',
        alignItems: isDesktop ? 'center' : 'stretch',
        justifyContent: 'space-between',
        gap: { xs: 2, md: 1.5 },
        width: '100%',
        minWidth: 0,
      }}
    >
      {/* LEFT: TITLE BLOCK */}
      <Box sx={{ minWidth: 0, flexShrink: 0 }}>
        <Typography
          component="h1"
          variant="h4"
          sx={{
            fontSize: { xs: '1.4rem', sm: '1.5rem', md: isXLarge ? '1.8rem' : '1.4rem' },
            fontWeight: 800,
            color: muiTheme.palette.primary.main, // Back to light blue (celeste)
            fontFamily: 'Outfit, sans-serif',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.8125rem',
              color: 'rgba(255, 255, 255, 0.6)',
              mt: 0.5
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {/* RIGHT: FILTERS & ACTIONS BLOCK */}
      <Stack
        direction="row"
        useFlexGap
        sx={{
          flex: 1,
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: isDesktop ? 'flex-end' : 'flex-start',
          gap: isXLarge ? 1.5 : 1,
          minWidth: 0,
        }}
      >
        {filters && (
          <Box sx={{ minWidth: 0, flexShrink: 1 }}>
            {filters}
          </Box>
        )}
        
        <Stack direction="row" useFlexGap sx={{ gap: 1, alignItems: 'center', flexShrink: 0 }}>
          {actions}
          {children}
          
          {secondaryBtn && (
            secondaryButtonRequiresAdmin
              ? <PermissionGate requireAdmin>{secondaryBtn}</PermissionGate>
              : secondaryBtn
          )}

          {primaryBtn && (
            buttonRequiresAdmin
              ? <PermissionGate requireAdmin>{primaryBtn}</PermissionGate>
              : primaryBtn
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
