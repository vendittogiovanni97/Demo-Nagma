"use client";

import type { SxProps, Theme } from '@mui/material';
import type { ReactNode } from 'react';
import { Box, Stack, Typography, useTheme } from '@mui/material';

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
    <Stack
      sx={{
        gap: 1.5,
        width: '100%',
      }}
    >
      <Stack
        direction="row"
        useFlexGap
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          flexWrap: 'wrap',
          width: '100%',
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: '1.6rem', md: '1.8rem' },
              fontWeight: 700,
              color: theme.palette.primary.main,
              fontFamily: 'Outfit, sans-serif',
              lineHeight: 1.1,
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
                marginTop: theme.spacing(0.5),
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {children}

        {actions ? (
          <Stack direction="row" useFlexGap sx={{ gap: 1, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {actions}
          </Stack>
        ) : null}
      </Stack>

      {bottomContent ? (
        <Box sx={{ width: '100%' }}>
          {bottomContent}
        </Box>
      ) : null}
    </Stack>
  );
}
