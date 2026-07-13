'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Icon from '@/common/components/ui/Icon';

export const NoRowsOverlay = React.memo((props: { message?: string; hint?: string }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1.25,
      py: 5,
      px: 3,
      textAlign: 'center',
    }}
  >
    <Box
      sx={{
        width: 52,
        height: 52,
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'action.hover',
        color: 'primary.main',
      }}
    >
      <Icon name="cerca" />
    </Box>
    <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>
      {props.message ?? 'Nessun risultato'}
    </Typography>
    {props.hint && (
      <Typography variant="body2" sx={{ maxWidth: 320 }}>
        {props.hint}
      </Typography>
    )}
  </Box>
));
NoRowsOverlay.displayName = 'NoRowsOverlay';

export const LoadingOverlay = React.memo(() => (
  <Box sx={{ width: '100%', px: 2, py: 1.5 }}>
    {Array.from({ length: 6 }).map((_, index) => (
      <Box
        key={index}
        sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center', py: 1.25 }}
      >
        <Skeleton variant="text" width="6%" />
        <Skeleton variant="text" width="26%" />
        <Skeleton variant="text" width="20%" />
        <Skeleton variant="text" width="16%" />
        <Skeleton variant="rounded" width={64} height={20} sx={{ ml: 'auto' }} />
      </Box>
    ))}
  </Box>
));
LoadingOverlay.displayName = 'LoadingOverlay';
