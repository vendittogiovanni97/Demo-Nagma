"use client";

import { Chip, SxProps, Theme, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { LucideIcon } from 'lucide-react';
import React from 'react';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'default' | string;

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  label?: string;
  className?: string;
  sx?: SxProps<Theme>;
  removable?: boolean;
  onRemove?: () => void;
  onClick?: (e: React.MouseEvent) => void;
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon: Icon,
  label,
  className,
  sx,
  removable,
  onRemove,
  onClick,
}: BadgeProps) {
  const theme = useTheme();

  const getColors = () => {
    const isLight = theme.palette.mode === 'light';
    const buildColors = (color: string) => ({
      bg: alpha(color, isLight ? 0.12 : 0.22),
      text: isLight ? color : theme.palette.common.white,
      border: alpha(color, isLight ? 0.32 : 0.55),
    });
    switch (variant) {
      case 'primary':
      case 'status-confirmed':
        return buildColors(theme.palette.primary.main);

      case 'info':
      case 'status-created':
        return buildColors(theme.palette.info.main);

      case 'success':
      case 'status-completed':
        return buildColors(theme.palette.success.main);

      case 'warning':
      case 'status-updated':
        return buildColors(theme.palette.warning.main);

      case 'status-rescheduled':
        return buildColors(theme.palette.custom.purple);

      case 'error':
      case 'status-cancelled':
        return buildColors(theme.palette.error.main);

      case 'status-deleted':
        return buildColors(theme.palette.text.secondary);

      default:
        return buildColors(theme.palette.text.secondary);
    }
  };

  const colors = getColors();

  return (
    <Chip
      onClick={onClick}
      onDelete={removable ? onRemove : undefined}
      icon={Icon ? <Icon size={size === 'xs' ? 10 : size === 'sm' ? 12 : 14} /> : undefined}
      label={label || children}
      className={className}
      sx={{
        height: size === 'xs' ? 20 : size === 'sm' ? 24 : size === 'md' ? 28 : 32,
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        fontWeight: 700,
        fontSize: size === 'xs' ? '0.6rem' : size === 'sm' ? '0.65rem' : '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        '& .MuiChip-label': { px: 1.5 },
        '& .MuiChip-icon': { color: 'inherit', ml: 1, mr: -0.5 },
        ...sx,
      }}
    />
  );
}
