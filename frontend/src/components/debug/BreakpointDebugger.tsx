"use client";

import React from 'react';
import { Box, Stack, SxProps, Theme } from '@mui/material';
import { useTheme as useThemeContext } from '@/context/ThemeContext';

export function BreakpointDebugger() {
  const { isSmall, isMedium, isLarge, size } = useThemeContext();

  return (
    <Box sx={styles.container}>
      <Stack useFlexGap sx={{ gap: 0.5 }}>
        <Box>
          Size: <Box component="span" sx={{ fontWeight: 700 }}>{size}</Box>
        </Box>
        <Box>Small: {isSmall ? '✓' : '✗'}</Box>
        <Box>Medium: {isMedium ? '✓' : '✗'}</Box>
        <Box>Large: {isLarge ? '✓' : '✗'}</Box>
      </Stack>
    </Box>
  );
}

const styles = {
  container: {
    position: 'fixed', bottom: 16, right: 16, p: 1.5,
    bgcolor: 'background.paper', color: 'text.primary',
    fontSize: '0.75rem', borderRadius: 1, fontFamily: 'monospace',
    zIndex: 9999, opacity: 0.85, border: '1px solid', borderColor: 'divider'
  } as SxProps<Theme>,
};
