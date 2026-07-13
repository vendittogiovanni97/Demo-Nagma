'use client';
import React from 'react';
import Box from '@mui/material/Box';

export const MonoText = ({ children }: { children: React.ReactNode }) => (
  <Box
    component="span"
    sx={(theme: any) => ({
      fontFamily: theme.fontFamilyMono ?? 'monospace',
      fontVariantNumeric: 'tabular-nums',
      fontSize: '0.82rem',
      letterSpacing: '-0.01em',
      color: 'text.primary',
    })}
  >
    {children}
  </Box>
);

export default MonoText;
