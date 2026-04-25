'use client';

import { memo } from 'react';
import { Avatar as MuiAvatar, useTheme, type SxProps, type Theme } from '@mui/material';

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
      return `${firstName.charAt(0)}${lastName.charAt(0)}`;
    }
    if (name) {
      return name.charAt(0).toUpperCase();
    }
    return '?';
  };

  const avatarSize = sizeMap[size];

  return (
    <MuiAvatar
      sx={{
        width: avatarSize,
        height: avatarSize,
        fontWeight: 600,
        flexShrink: 0,
        transition: 'transform 0.2s ease-in-out',
        cursor: 'pointer',
        '&:hover': {
          transform: 'scale(1.1)',
        },
        backgroundColor: color || `linear-gradient(135deg, ${theme.palette.primary.main}33 0%, ${theme.palette.primary.main}11 100%)`,
        color: color ? '#fff' : theme.palette.primary.main,
        fontSize: size === 'sm' ? '0.75rem' : size === 'lg' ? '1.125rem' : '0.875rem',
        ...sx,
      }}
      src={undefined}
    >
      {getInitials()}
    </MuiAvatar>
  );
}

export default memo(Avatar);
