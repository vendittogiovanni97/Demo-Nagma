"use client";

import Icon from '@/common/components/ui/Icon';
import Card from '@/common/components/ui/Card';
import { Box, Stack, Typography, useTheme, type SxProps, type Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';

export interface DashboardWidgetCardProps {
  title: ReactNode;
  subtitle?: ReactNode;
  icon: string;
  headerActions?: ReactNode;
  isLoading?: boolean;
  className?: string;
  sx?: SxProps<Theme>;
  children: ReactNode;
}

export default function DashboardWidgetCard({
  title,
  subtitle,
  icon,
  headerActions,
  isLoading = false,
  className,
  sx,
  children,
}: DashboardWidgetCardProps) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  return (
    <Card
      className={className}
      variant="glass"
      size="md"
      sx={[
        {
          bgcolor: isLight ? 'background.paper' : alpha(theme.palette.background.default, 0.5),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          boxShadow: isLight
            ? `0 2px 12px ${alpha(theme.palette.common.black, 0.08)}`
            : `0 8px 32px ${alpha(theme.palette.common.black, 0.4)}`,
          transition: theme.transitions.create(['all'], { duration: 300 }),
          '&:hover': {
            borderColor: alpha(theme.palette.primary.main, 0.3),
            boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.08)}`,
          },
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: { xs: 1, md: 1.5 },
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <Stack direction="row" useFlexGap sx={{ gap: 1.5, alignItems: 'center' }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              boxShadow: `0 0 15px ${alpha(theme.palette.primary.main, 0.12)}`,
              backdropFilter: 'blur(8px)',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name={icon} size={18} />
          </Box>
          <Box>
            {typeof title === 'string' ? (
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {title}
              </Typography>
            ) : (
              title
            )}
            {subtitle && (
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
        {headerActions}
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          opacity: isLoading ? 0.65 : 1,
          transition: 'opacity 0.2s ease-in-out',
        }}
      >
        {children}
      </Box>
    </Card>
  );
}
