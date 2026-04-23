"use client";

import { memo } from 'react';
import { cn } from '@/utils/cn';

type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  firstName?: string;
  lastName?: string;
  name?: string;
  color?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-lg',
};

function Avatar({
  firstName,
  lastName,
  name,
  color,
  size = 'md',
  className,
}: AvatarProps) {
  const getInitials = (): string => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`;
    }
    if (name) {
      return name.charAt(0).toUpperCase();
    }
    return '?';
  };

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold shrink-0 transition-transform hover:scale-110',
        sizeStyles[size],
        !color && 'bg-linear-to-br from-accent/20 to-accent/5 text-accent',
        color && 'text-white',
        className
      )}
      style={color ? { backgroundColor: color } : undefined}
    >
      {getInitials()}
    </div>
  );
}

export default memo(Avatar);
