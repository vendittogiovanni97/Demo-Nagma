'use client';

import React from 'react';
import MuiChip, { ChipProps as MuiChipProps } from '@mui/material/Chip';

export type ChipProps = MuiChipProps;

export const Chip = ({
  label,
  color = 'default',
  variant = 'filled',
  size = 'medium',
  onDelete,
  onClick,
  ...remainingProps
}: ChipProps) => {
  return (
    <MuiChip
      label={label}
      color={color}
      variant={variant}
      size={size}
      onDelete={onDelete}
      onClick={onClick}
      {...remainingProps}
    />
  );
};

export default Chip;
