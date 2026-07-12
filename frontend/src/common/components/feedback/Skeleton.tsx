"use client";

import React from 'react';
import { alpha } from '@mui/material/styles';
import { Box, keyframes, SxProps, Theme, useTheme } from '@mui/material';

interface SkeletonProps {
  sx?: SxProps<Theme>;
  variant?: 'rect' | 'circle' | 'text';
  width?: string | number;
  height?: string | number;
}

const pulseAnimation = keyframes`
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
`;

export const Skeleton: React.FC<SkeletonProps> = ({
  sx = {},
  variant = 'rect',
  width = 'auto',
  height = 'auto'
}) => {
  const theme = useTheme();
  const variantStyle = {
    rect: { borderRadius: 1.5 },
    circle: { borderRadius: '50%' },
    text: { borderRadius: 1, height: 16, width: '100%' }
  }[variant];

  return (
    <Box
      sx={Object.assign(
        {
          animation: `${pulseAnimation} 2s ease-in-out infinite`,
          bgcolor: alpha(theme.palette.common.white, 0.05),
          border: `1px solid ${alpha(theme.palette.common.white, 0.05)}`,
          width, height,
        },
        variantStyle,
        sx as any,
      )}
    />
  );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) => {
  return (
    <Box sx={(t) => styles.tableContainer(t)}>
      <Box sx={(t) => styles.tableHeader(t)}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} width={96} height={16} />
        ))}
      </Box>
      <Box sx={styles.tableBody}>
        {Array.from({ length: rows }).map((_, i) => (
          <Box key={i} sx={styles.tableRow}>
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton key={j} width={j === 0 ? 128 : 80} height={16} />
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export const BentoSkeleton = () => {
  return (
    <Box sx={(t) => styles.bentoContainer(t)}>
      <Box sx={styles.bentoHeader}>
        <Skeleton width={128} height={32} />
        <Skeleton variant="circle" width={40} height={40} />
      </Box>
      <Box sx={styles.bentoBody}>
        <Skeleton height={16} width="100%" />
        <Skeleton height={16} width="66%" />
      </Box>
      <Box sx={styles.bentoFooter}>
        <Skeleton height={48} width="100%" sx={{ borderRadius: 2 }} />
      </Box>
    </Box>
  );
};

const styles = {
  tableContainer: (theme: Theme) => ({
    width: '100%', border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
    borderRadius: 3, overflow: 'hidden', bgcolor: alpha(theme.palette.common.white, 0.02)
  }),
  tableHeader: (theme: Theme) => ({
    p: 3, borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`, display: 'flex', gap: 2
  }),
  tableBody: {
    p: 3, display: 'flex', flexDirection: 'column', gap: 3
  } as SxProps<Theme>,
  tableRow: {
    display: 'flex', gap: 2, alignItems: 'center'
  } as SxProps<Theme>,
  bentoContainer: (theme: Theme) => ({
    bgcolor: alpha(theme.palette.common.white, 0.03), border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
    borderRadius: 3.75, p: 4, display: 'flex', flexDirection: 'column', gap: 3,
    animation: `${pulseAnimation} 2s ease-in-out infinite`
  }),
  bentoHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
  } as SxProps<Theme>,
  bentoBody: {
    flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5
  } as SxProps<Theme>,
  bentoFooter: {
    mt: 'auto'
  } as SxProps<Theme>,
};
