"use client";

import { Box, Typography, useTheme, type SxProps, type Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Inbox, type LucideIcon } from 'lucide-react';
import Button from '@/common/components/ui/Button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  height?: number | string;
  variant?: 'card' | 'flat';
  className?: string;
  sx?: SxProps<Theme>;
}

export default function EmptyState({
  title = 'Nessun dato disponibile',
  description,
  icon: IconComponent = Inbox,
  actionLabel,
  onAction,
  height = '100%',
  variant = 'flat',
  className,
  sx,
}: EmptyStateProps) {
  const theme = useTheme();
  const isCard = variant === 'card';

  return (
    <Box
      className={className}
      sx={[
        {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          p: isCard ? 4 : 2,
          height,
          width: '100%',
          borderRadius: isCard ? 3 : 0,
          bgcolor: isCard
            ? (theme.palette.mode === 'light'
                ? alpha(theme.palette.common.black, 0.01)
                : alpha(theme.palette.common.white, 0.02))
            : 'transparent',
          border: isCard ? `1px dashed ${alpha(theme.palette.primary.main, 0.15)}` : 'none',
          boxShadow: 'none',
          transition: 'all 0.3s ease',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ].filter(Boolean) as SxProps<Theme>}
    >
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1.5,
          boxShadow: `0 0 16px ${alpha(theme.palette.primary.main, 0.12)}`,
        }}
      >
        <IconComponent size={26} style={{ color: theme.palette.primary.main, opacity: 0.85 }} />
      </Box>

      <Typography
        sx={{
          fontSize: '0.875rem',
          fontWeight: 700,
          color: theme.palette.text.primary,
          fontFamily: 'Outfit, sans-serif',
          mb: description ? 0.5 : 0,
        }}
      >
        {title}
      </Typography>

      {description && (
        <Typography
          sx={{
            fontSize: '0.785rem',
            color: theme.palette.text.secondary,
            maxWidth: 320,
            lineHeight: 1.5,
          }}
        >
          {description}
        </Typography>
      )}

      {actionLabel && onAction && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onAction}
          sx={{ mt: 2, px: 2, fontSize: '0.75rem' }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
