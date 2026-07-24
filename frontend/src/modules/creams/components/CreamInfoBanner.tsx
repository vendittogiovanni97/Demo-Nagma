"use client";

import { Box, useTheme, alpha } from '@mui/material';
import Icon from '@/common/components/ui/Icon';

interface CreamInfo {
  id: number;
  name: string;
  description: string | null;
}

interface CreamInfoBannerProps {
  creamData: CreamInfo;
  salesCount: number;
}

export default function CreamInfoBanner({ creamData, salesCount }: CreamInfoBannerProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        px: 2,
        py: 1.25,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        bgcolor: alpha(theme.palette.background.paper, 0.6),
        backdropFilter: 'blur(12px)',
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1.5,
          bgcolor: `${theme.palette.primary.main}1a`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: theme.palette.primary.main,
        }}
      >
        <Icon name="package" size={18} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          component="h2"
          sx={{
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: theme.palette.text.primary,
            lineHeight: 1.2,
            m: 0,
          }}
        >
          {creamData.name}
        </Box>
        {creamData.description && (
          <Box
            sx={{
              fontSize: '0.75rem',
              color: theme.palette.text.secondary,
              mt: 0.25,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {creamData.description}
          </Box>
        )}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75, flexShrink: 0 }}>
        <Box
          sx={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: theme.palette.primary.main,
            lineHeight: 1,
          }}
        >
          {salesCount}
        </Box>
        <Box
          sx={{
            fontSize: '0.6875rem',
            color: theme.palette.text.secondary,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Vendute
        </Box>
      </Box>
    </Box>
  );
}
