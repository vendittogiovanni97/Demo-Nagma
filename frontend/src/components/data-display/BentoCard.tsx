'use client';

import type { ReactNode } from 'react';
import { Box, Card, type SxProps, type Theme, Typography } from '@mui/material';

interface BentoCardProps {
  title?: string;
  header?: ReactNode;
  children: ReactNode;
  sx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
}

export default function BentoCard({
  title,
  header,
  children,
  sx,
  contentSx,
}: BentoCardProps) {
  return (
    <Card
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      }}
    >
      {header ? (
        <Box sx={{ mb: 2 }}>{header}</Box>
      ) : title ? (
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
          }}
        >
          {title}
        </Typography>
      ) : null}
      <Box
        sx={{
          flex: 1,
          ...contentSx,
        }}
      >
        {children}
      </Box>
    </Card>
  );
}
