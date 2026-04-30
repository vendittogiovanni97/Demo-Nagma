"use client";

import React from 'react';
import { Box, useTheme, SxProps, Theme } from '@mui/material';
import Card from '@/components/ui/Card';

interface StatCardProps {
  value: string;
  label: string;
  color?: string;
  sx?: SxProps<Theme>;
}

export default function StatCard({
  value,
  label,
  color,
  sx = {}
}: StatCardProps) {
  const theme = useTheme();
  const textColor = color || theme.palette.text.primary;

  return (
    <Card variant="glass" size="md" sx={[styles.card, ...(Array.isArray(sx) ? sx : [sx])] as any}>
      <Box sx={[styles.value, { color: textColor }] as any}>
        {value}
      </Box>
      <Box sx={styles.label}>
        {label}
      </Box>
    </Card>
  );
}

const styles = {
  card: {
    textAlign: 'center', display: 'flex', flexDirection: 'column',
    justifyContent: 'center', minHeight: '100px'
  } as SxProps<Theme>,
  value: {
    fontSize: '1.875rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif',
    transition: 'transform 0.3s ease',
    '&:hover': { transform: 'scale(1.1)' }
  } as SxProps<Theme>,
  label: {
    fontSize: '0.625rem', color: 'text.secondary', textTransform: 'uppercase',
    letterSpacing: '0.12em', mt: 0.5, fontWeight: 600
  } as SxProps<Theme>,
};
