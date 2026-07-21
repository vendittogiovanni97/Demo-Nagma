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
    switch (variant) {
      case 'primary':
      case 'status-confirmed':
        return {
          bg: alpha(theme.palette.primary.main, isLight ? 0.12 : 0.22),
          text: isLight ? theme.palette.primary.dark : theme.palette.primary.light,
          border: alpha(theme.palette.primary.main, 0.35),
        };

      case 'info':
      case 'status-created':
        return {
          bg: alpha(theme.palette.info.main, isLight ? 0.12 : 0.2),
          text: isLight ? theme.palette.info.dark : theme.palette.info.light,
          border: alpha(theme.palette.info.main, 0.3),
        };

      case 'success':
      case 'status-completed':
        return {
          bg: alpha(theme.palette.success.main, isLight ? 0.12 : 0.2),
          text: isLight ? '#047857' : theme.palette.success.light,
          border: alpha(theme.palette.success.main, 0.3),
        };

      case 'warning':
      case 'status-updated':
      case 'status-rescheduled':
        return {
          bg: alpha(theme.palette.warning.main, isLight ? 0.14 : 0.22),
          text: isLight ? '#b45309' : theme.palette.warning.light,
          border: alpha(theme.palette.warning.main, 0.35),
        };

      case 'error':
      case 'status-cancelled':
      case 'status-deleted':
        return {
          bg: alpha(theme.palette.error.main, isLight ? 0.12 : 0.22),
          text: isLight ? '#c53030' : theme.palette.error.light,
          border: alpha(theme.palette.error.main, 0.3),
        };

      default:
        return {
          bg: isLight ? alpha(theme.palette.text.primary, 0.06) : alpha(theme.palette.common.white, 0.05),
          text: theme.palette.text.secondary,
          border: isLight ? alpha(theme.palette.text.primary, 0.12) : alpha(theme.palette.common.white, 0.1),
        };
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
