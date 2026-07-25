'use client';

import Switch from '@mui/material/Switch';

export interface StatusToggleButtonProps {
  currentStatus: string;
  onClick: () => void;
  disabled?: boolean;
}

export default function StatusToggleButton({
  currentStatus,
  onClick,
  disabled,
}: StatusToggleButtonProps) {
  const isChecked = currentStatus === 'ATTIVO' || currentStatus === 'ACTIVE';

  return (
    <Switch
      checked={isChecked}
      onChange={onClick}
      disabled={disabled}
      size="small"
    />
  );
}
