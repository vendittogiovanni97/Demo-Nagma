'use client';

import Alert, { type AlertProps } from '@mui/material/Alert';

export interface StatusBannerProps extends AlertProps {}

export default function StatusBanner({
  children,
  severity = 'error',
  onClose,
  sx,
  ...props
}: StatusBannerProps) {
  return (
    <Alert severity={severity} onClose={onClose} sx={{ mb: 3, ...sx }} {...props}>
      {children}
    </Alert>
  );
}
