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
    switch (variant) {
      case 'primary': return { bg: alpha(theme.palette.primary.main, 0.1), text: theme.palette.primary.main, border: alpha(theme.palette.primary.main, 0.2) };
      case 'success': return { bg: alpha(theme.palette.success.main, 0.1), text: theme.palette.success.main, border: alpha(theme.palette.success.main, 0.2) };
      case 'warning': return { bg: alpha(theme.palette.warning.main, 0.1), text: theme.palette.warning.main, border: alpha(theme.palette.warning.main, 0.2) };
      case 'error': return { bg: alpha(theme.palette.error.main, 0.1), text: theme.palette.error.main, border: alpha(theme.palette.error.main, 0.2) };
      case 'info': return { bg: alpha(theme.palette.info.main, 0.1), text: theme.palette.info.main, border: alpha(theme.palette.info.main, 0.2) };
      default: return { bg: alpha(theme.palette.common.white, 0.05), text: alpha(theme.palette.common.white, 0.7), border: alpha(theme.palette.common.white, 0.1) };
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
