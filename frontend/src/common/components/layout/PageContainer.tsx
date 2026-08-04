"use client";

import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material';
import type { ReactNode } from 'react';

export interface PageContainerProps {
  children: ReactNode;
  gap?: number | string;
  px?: any;
  pt?: any;
  pb?: any;
  sx?: SxProps<Theme>;
}

export default function PageContainer({
  children,
  gap = 1.5,
  px = { xs: 1, sm: 2 },
  pt,
  pb,
  sx,
}: PageContainerProps) {
  return (
    <Box
      sx={[
        {
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
          flex: 1,
          gap,
          px,
          pt,
          pb,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
}
