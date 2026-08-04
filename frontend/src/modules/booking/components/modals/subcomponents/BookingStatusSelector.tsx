"use client";

import Badge from '@/common/components/ui/Badge';
import { BOOKING_STATUS_CONFIG } from '@/common/config/status-config';
import type { BookingStatus } from '@/modules/booking/model/booking.types';
import { Box, Grid } from '@mui/material';

interface BookingStatusSelectorProps {
  status: BookingStatus;
  onChangeStatus: (status: BookingStatus) => void;
}

export function BookingStatusSelector({
  status,
  onChangeStatus,
}: BookingStatusSelectorProps) {
  return (
    <Grid size={12}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' },
          gap: 1.5,
        }}
      >
        {(Object.entries(BOOKING_STATUS_CONFIG) as Array<[
          BookingStatus,
          (typeof BOOKING_STATUS_CONFIG)[string],
        ]>).map(([st, config]) => {
          const isSelected = status === st;
          return (
            <Box
              key={st}
              component="button"
              type="button"
              aria-pressed={isSelected}
              aria-label={`Imposta stato ${config.label}`}
              onClick={() => onChangeStatus(st)}
              sx={{
                background: 'none',
                border: 'none',
                p: 0,
                cursor: 'pointer',
                opacity: isSelected ? 1 : 0.6,
                transform: isSelected ? 'scale(1.02)' : 'none',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  opacity: 1,
                },
              }}
            >
              <Badge
                variant={config.badgeVariant}
                size="lg"
                sx={{
                  width: '100%',
                  height: 40,
                  pointerEvents: 'none',
                  '& .MuiChip-label': {
                    width: '100%',
                    textAlign: 'center',
                  },
                }}
              >
                {config.label}
              </Badge>
            </Box>
          );
        })}
      </Box>
    </Grid>
  );
}
