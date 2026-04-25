"use client";

import { Box, useTheme } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
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
    <Card variant="glass" size="md" sx={{ textAlign: 'center', ...sx }}>
      <Box
        sx={{
          fontSize: '1.875rem',
          fontWeight: 'bold',
          color: textColor,
          fontFamily: 'Outfit',
          transition: 'transform 0.3s ease',
          '&:hover': {
            transform: 'scale(1.1)'
          }
        }}
      >
        {value}
      </Box>
      <Box
        sx={{
          fontSize: '0.625rem',
          color: theme.palette.text.secondary,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          mt: 0.5
        }}
      >
        {label}
      </Box>
    </Card>
  );
}
