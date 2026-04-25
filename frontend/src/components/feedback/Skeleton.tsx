import React from 'react';
import { Box, keyframes } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface SkeletonProps {
  sx?: SxProps<Theme>;
  variant?: 'rect' | 'circle' | 'text';
  width?: string | number;
  height?: string | number;
}

const pulseAnimation = keyframes`
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
`;

export const Skeleton: React.FC<SkeletonProps> = ({
  sx = {},
  variant = 'rect',
  width = 'auto',
  height = 'auto'
}) => {
  const theme = useTheme();

  const variantStyles = {
    rect: { borderRadius: 12 },
    circle: { borderRadius: '50%' },
    text: { borderRadius: 8, height: 16, width: '100%' }
  };

  return (
    <Box
      sx={{
        animation: `${pulseAnimation} 2s ease-in-out infinite`,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: `1px solid rgba(255, 255, 255, 0.05)`,
        width,
        height,
        ...variantStyles[variant],
        ...sx
      }}
    />
  );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: '100%',
        border: `1px solid rgba(255, 255, 255, 0.1)`,
        borderRadius: 3,
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.02)'
      }}
    >
      <Box
        sx={{
          p: 3,
          borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
          display: 'flex',
          gap: 2
        }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} width={96} height={16} />
        ))}
      </Box>
      <Box
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }}
      >
        {Array.from({ length: rows }).map((_, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
    <Box
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: `1px solid rgba(255, 255, 255, 0.1)`,
        borderRadius: 3.75,
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        animation: `${pulseAnimation} 2s ease-in-out infinite`
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}
      >
        <Skeleton width={128} height={32} />
        <Skeleton variant="circle" width={40} height={40} />
      </Box>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5
        }}
      >
        <Skeleton height={16} width="100%" />
        <Skeleton height={16} width="66.666%" />
      </Box>
      <Box
        sx={{
          marginTop: 'auto'
        }}
      >
        <Skeleton height={48} width="100%" sx={{ borderRadius: 2 }} />
      </Box>
    </Box>
  );
};
