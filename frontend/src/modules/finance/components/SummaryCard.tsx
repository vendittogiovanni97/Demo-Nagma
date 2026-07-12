"use client";

import { Box, Stack, Typography, useTheme } from '@mui/material';
import Card from '@/common/components/ui/Card';
import { formatPrice } from '@/common/shared/utils/format';

interface SummaryCardProps {
  title: string;
  amount: number;
  icon: React.ReactNode;
  color: string;
  isLoading: boolean;
}

export default function SummaryCard({ title, amount, icon, color, isLoading }: SummaryCardProps) {
  const theme = useTheme();
  return (
    <Card
      sx={{
        borderRadius: 3,
        border: `1px solid ${color}20`,
        background: `linear-gradient(135deg, ${color}08 0%, transparent 100%)`,
      }}
    >
        <Stack
          sx={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                mt: 0.5,
                color: amount < 0 ? theme.palette.error.main : 'text.primary',
              }}
            >
              {isLoading ? '...' : formatPrice(amount)}
            </Typography>
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: `${color}15`,
              color: color,
            }}
          >
            {icon}
          </Box>
        </Stack>
    </Card>
  );
}
