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

const cyanShimmerAnimation = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
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

  const primaryCyan = theme.palette.primary.main;
  const isLight = theme.palette.mode === 'light';

  return (
    <Box
      sx={Object.assign(
        {
          position: 'relative',
          overflow: 'hidden',
          width,
          height,
          bgcolor: isLight
            ? alpha(theme.palette.common.black, 0.04)
            : alpha(theme.palette.common.white, 0.04),
          backgroundImage: `linear-gradient(90deg, transparent 0%, ${alpha(primaryCyan, 0.18)} 50%, transparent 100%)`,
          backgroundSize: '200% 100%',
          animation: `${cyanShimmerAnimation} 2s infinite linear`,
          border: `1px solid ${alpha(primaryCyan, 0.15)}`,
        },
        variantStyle,
        sx as any,
      )}
    />
  );
};

export const FormSkeleton = ({ fields = 4 }: { fields?: number }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1, px: 0.5, width: '100%' }}>
      {Array.from({ length: fields }).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Skeleton variant="text" width={100} height={14} />
          <Skeleton variant="rect" width="100%" height={44} sx={{ borderRadius: 2 }} />
        </Box>
      ))}
    </Box>
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
  tableContainer: (theme: Theme) => {
    const isLight = theme.palette.mode === 'light';
    return {
      width: '100%',
      border: `1px solid ${isLight ? alpha(theme.palette.common.black, 0.08) : alpha(theme.palette.common.white, 0.1)}`,
      borderRadius: 3,
      overflow: 'hidden',
      bgcolor: isLight ? alpha(theme.palette.common.black, 0.02) : alpha(theme.palette.common.white, 0.02),
    };
  },
  tableHeader: (theme: Theme) => {
    const isLight = theme.palette.mode === 'light';
    return {
      p: 3,
      borderBottom: `1px solid ${isLight ? alpha(theme.palette.common.black, 0.08) : alpha(theme.palette.common.white, 0.1)}`,
      display: 'flex',
      gap: 2,
    };
  },
  tableBody: {
    p: 3, display: 'flex', flexDirection: 'column', gap: 3
  } as SxProps<Theme>,
  tableRow: {
    display: 'flex', gap: 2, alignItems: 'center'
  } as SxProps<Theme>,
  bentoContainer: (theme: Theme) => {
    const isLight = theme.palette.mode === 'light';
    return {
      bgcolor: isLight ? alpha(theme.palette.common.black, 0.02) : alpha(theme.palette.common.white, 0.03),
      border: `1px solid ${isLight ? alpha(theme.palette.common.black, 0.08) : alpha(theme.palette.common.white, 0.1)}`,
      borderRadius: 3.75,
      p: 4,
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
    };
  },
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
