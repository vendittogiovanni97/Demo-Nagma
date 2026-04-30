"use client";

import { Box, Card, SxProps, Theme, Typography } from '@mui/material';
import { ReactNode } from 'react';

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
    <Card sx={[styles.card, ...(Array.isArray(sx) ? sx : [sx]) ] as any}>
      {header ? (
        <Box sx={styles.header}>{header}</Box>
      ) : title ? (
        <Typography variant="h6" sx={styles.title}>
          {title}
        </Typography>
      ) : null}
      <Box sx={[{ flex: 1 }, ...(Array.isArray(contentSx) ? contentSx : [contentSx])] as any}>
        {children}
      </Box>
    </Card>
  );
}

const styles = {
  card: {
    bgcolor: 'rgba(255, 255, 255, 0.04)', backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)', p: 3,
    display: 'flex', flexDirection: 'column', borderRadius: 4,
    transition: 'all 0.3s ease',
    '&:hover': {
      bgcolor: 'rgba(255, 255, 255, 0.06)',
      borderColor: 'rgba(0, 191, 255, 0.2)',
      transform: 'translateY(-2px)'
    }
  } as SxProps<Theme>,
  header: {
    mb: 2
  } as SxProps<Theme>,
  title: {
    mb: 2, fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: 'text.primary'
  } as SxProps<Theme>,
};
