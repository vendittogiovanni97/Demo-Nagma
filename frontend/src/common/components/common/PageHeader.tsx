"use client";

import { alpha } from '@mui/material/styles';
import { Box, Stack, Typography, useTheme as useMuiTheme } from '@mui/material';
import { useBreakpointContext } from '@/common/context/BreakpointContext';
import type { ReactNode } from 'react';
import PermissionGate from '@/common/components/auth/PermissionGate';
import Button from '@/common/components/ui/Button';
import ExportModal, { type ExportColumn, type ExportFilter, type ExportFilters } from '@/common/components/modals/ExportModal';
import SmartFilters, { type SmartFiltersProps } from '@/common/components/common/SmartFilters';

export type { ExportColumn, ExportFilter, ExportFilters, SmartFiltersProps };

export interface HeaderExportConfig<T = any> {
  filenameBase: string;
  title: string;
  getExportNaming?: (filterValues: Record<string, string>) => { title?: string; filenameBase?: string };
  rows: T[];
  columns: ExportColumn<T>[];
  filters?: ExportFilter<T>[];
  filtersLabel?: string;
  resolveRows?: () => Promise<T[]>;
  useBackendFilters?: boolean;
  getFilterParams?: () => ExportFilters;
  getPdfSummary?: (rows: T[]) => { label: string; value: string };
  getPdfRowVariant?: (row: T) => 'success' | undefined;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
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
  /** Direct SmartFilters configuration to automatically render SmartFilters */
  smartFilters?: SmartFiltersProps;
  /** Custom filter bar (usually SmartFilters) */
  filters?: ReactNode;
  /** Let the filter area consume the remaining horizontal space. */
  expandFilters?: boolean;
  /** Direct export configuration to automatically render ExportModal */
  exportConfig?: HeaderExportConfig;
  /** Other actions like Export, etc. */
  actions?: ReactNode;
  /** Legacy support or extra content */
  children?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  icon,
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
  smartFilters,
  filters,
  expandFilters = false,
  exportConfig,
  actions,
  children,
}: PageHeaderProps) {
  const { isXLarge, isLarge } = useBreakpointContext();
  const muiTheme = useMuiTheme();

  const exportBtn = exportConfig ? <ExportModal {...exportConfig} /> : null;
  const filterContent = filters ?? (smartFilters ? <SmartFilters {...smartFilters} /> : null);

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
        <Stack direction="row" useFlexGap sx={{ gap: 1.5, alignItems: 'center' }}>
          {icon && (
            <Box
              sx={{
                p: 1,
                borderRadius: 2.5,
                bgcolor: alpha(muiTheme.palette.primary.main, 0.08),
                border: `1px solid ${alpha(muiTheme.palette.primary.main, 0.2)}`,
                boxShadow: `0 0 15px ${alpha(muiTheme.palette.primary.main, 0.12)}`,
                color: muiTheme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
          )}
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
        </Stack>
        {subtitle && (
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.8125rem',
              color: muiTheme.palette.text.secondary,
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
        {filterContent && (
          <Box sx={{ minWidth: 0, flex: expandFilters ? 1 : '0 1 auto' }}>
            {filterContent}
          </Box>
        )}
        
        <Stack direction="row" useFlexGap sx={{ gap: 1, alignItems: 'center', flexShrink: 0 }}>
          {exportBtn}
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
