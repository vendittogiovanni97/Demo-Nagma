'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { useTheme, alpha } from '@mui/material/styles';
import { formatPrice } from '@/common/shared/utils/format';
import type { ArtistRevenueItem } from '../model/artistRevenue.types';

interface ArtistRevenueCardProps {
  artist: ArtistRevenueItem;
  rank: number;
}

export default function ArtistRevenueCard({ artist, rank }: ArtistRevenueCardProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        borderRadius: 3,
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: alpha(theme.palette.common.white, 0.03),
        border: 1,
        borderColor: alpha(theme.palette.common.white, 0.08),
        transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: alpha(theme.palette.primary.main, 0.3),
          boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.2)}`,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: artist.color ? alpha(artist.color, 0.15) : alpha(theme.palette.primary.main, 0.15),
              border: 2,
              borderColor: artist.color || theme.palette.primary.main,
              color: artist.color || theme.palette.primary.main,
              fontWeight: 800,
              fontSize: '0.875rem',
              flexShrink: 0,
            }}
          >
            {artist.name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()}
          </Box>

          <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
            <Typography
              sx={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'text.primary',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              }}
            >
              {artist.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
              <Chip
                label={artist.type === 'APPRENDISTA' ? 'Apprendista' : 'Collaboratore'}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  border: 1,
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                }}
              />
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 1,
            py: 0.25,
            borderRadius: 1.5,
            backgroundColor: rank === 1
              ? alpha(theme.palette.warning.main, 0.15)
              : alpha(theme.palette.common.white, 0.05),
            color: rank === 1 ? 'warning.main' : 'text.secondary',
            fontSize: '0.75rem',
            fontWeight: 700,
          }}
        >
          #{rank}
        </Box>
      </Box>

      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          backgroundColor: alpha(theme.palette.common.white, 0.02),
          border: 1,
          borderColor: alpha(theme.palette.common.white, 0.05),
        }}
      >
        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Fatturato
        </Typography>
        <Typography
          sx={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: artist.totalRevenue > 0 ? 'text.primary' : 'text.disabled',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            mt: 0.5,
          }}
        >
          {formatPrice(artist.totalRevenue)}
        </Typography>
      </Box>
    </Box>
  );
}
