"use client";

import { Chip, SxProps, Theme } from '@mui/material';
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
}: BadgeProps) {
  const getColors = () => {
    switch (variant) {
      case 'primary': return { bg: 'rgba(0, 191, 255, 0.1)', text: '#00bfff', border: 'rgba(0, 191, 255, 0.2)' };
      case 'success': return { bg: 'rgba(76, 175, 80, 0.1)', text: '#4caf50', border: 'rgba(76, 175, 80, 0.2)' };
      case 'warning': return { bg: 'rgba(255, 152, 0, 0.1)', text: '#ff9800', border: 'rgba(255, 152, 0, 0.2)' };
      case 'error': return { bg: 'rgba(244, 67, 54, 0.1)', text: '#f44336', border: 'rgba(244, 67, 54, 0.2)' };
      case 'info': return { bg: 'rgba(33, 150, 243, 0.1)', text: '#2196f3', border: 'rgba(33, 150, 243, 0.2)' };
      default: return { bg: 'rgba(255, 255, 255, 0.05)', text: 'rgba(255, 255, 255, 0.7)', border: 'rgba(255, 255, 255, 0.1)' };
    }
  };

  const colors = getColors();

  return (
    <Chip
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
