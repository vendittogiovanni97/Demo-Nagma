'use client';

import { useTheme as useThemeContext } from '@/context/ThemeContext';
import { Box, Typography, Stack, useTheme } from '@mui/material';

export function BreakpointDebugger() {
  const { isSmall, isMedium, isLarge, size } = useThemeContext();
  const muiTheme = useTheme();

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 2,
        right: 2,
        p: 1.5,
        backgroundColor: muiTheme.palette.background.paper,
        color: muiTheme.palette.text.primary,
        fontSize: '0.75rem',
        borderRadius: 1,
        fontFamily: 'monospace',
        zIndex: 50,
        opacity: 0.85,
        border: `1px solid ${muiTheme.palette.divider}`,
      }}
    >
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
