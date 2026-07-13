"use client";

import React, { memo } from 'react';
import { alpha } from '@mui/material/styles';
import { Avatar as MuiAvatar, useTheme, SxProps, Theme } from '@mui/material';

type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  firstName?: string;
  lastName?: string;
  name?: string;
  color?: string;
  size?: AvatarSize;
  sx?: SxProps<Theme>;
}

const sizeMap: Record<AvatarSize, number> = {
  sm: 32,
  md: 40,
  lg: 48,
};

function Avatar({
  firstName,
  lastName,
  name,
  color,
  size = 'md',
  sx,
}: AvatarProps) {
  const theme = useTheme();

  const getInitials = (): string => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (name) {
      return name.charAt(0).toUpperCase();
    }
    return '?';
  };

  const avatarSize = sizeMap[size];

  return (
    <MuiAvatar
      sx={[
        styles.avatar,
        {
          width: avatarSize,
          height: avatarSize,
          fontSize: size === 'sm' ? '0.75rem' : size === 'lg' ? '1.125rem' : '0.875rem',
          backgroundColor: color || alpha(theme.palette.primary.main, 0.1),
          color: color ? 'common.white' : 'primary.main',
        },
        ...(Array.isArray(sx) ? sx : [sx])
      ] as any}
      src={undefined}
    >
      {getInitials()}
    </MuiAvatar>
  );
}

const styles = {
  avatar: {
    fontWeight: 600, flexShrink: 0, transition: 'all 0.2s ease-in-out', cursor: 'pointer',
    '&:hover': { transform: 'scale(1.1)', boxShadow: (t: Theme) => `0 0 12px ${alpha(t.palette.primary.main, 0.2)}` },
  } as SxProps<Theme>,
};

export default memo(Avatar);
