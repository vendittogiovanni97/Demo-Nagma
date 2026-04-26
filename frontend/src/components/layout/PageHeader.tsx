"use client";

import type { SxProps, Theme } from '@mui/material';
import { Box, Typography, useTheme } from '@mui/material';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  actions?: ReactNode;
  bottomContent?: ReactNode;
  titleSx?: SxProps<Theme>;
}

export default function PageHeader({ title, subtitle, children, actions, bottomContent, titleSx }: PageHeaderProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        width: '100%',
        minHeight: 48,
        minWidth: 0,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0, flex: 1 }}>
        <Typography
          variant="h4"
          sx={{
            fontSize: { xs: '1.4rem', md: '1.6rem' },
            fontWeight: 700,
            color: theme.palette.primary.main,
            fontFamily: 'Outfit, sans-serif',
            lineHeight: 1.1,
            flexShrink: 0,
            ...titleSx,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.8125rem',
              color: theme.palette.text.secondary,
            }}
          >
            {subtitle}
          </Typography>
        )}
        {children}
      </Box>

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: { xs: 'wrap', lg: 'nowrap' }, flexShrink: 0 }}>
        {actions}
      </Box>
    </Box>
  );
}
