"use client";

import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import Badge from './Badge';
import { CheckCircle, AlertCircle, Info, Zap, Trash2, Star } from 'lucide-react';

export default function BadgeStories() {
  const theme = useTheme();
  const [removableStates, setRemovableStates] = useState({
    info: true,
    warning: true,
    success: true,
  });

  const handleRemove = (key: keyof typeof removableStates) => {
    setRemovableStates((prev) => ({ ...prev, [key]: false }));
  };

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 1.5, md: 2, lg: 3 },
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Typography
        variant="h1"
        sx={{
          color: theme.palette.text.primary,
          mb: 4,
        }}
      >
        Badge Component Stories
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h2"
          sx={{
            color: theme.palette.text.primary,
            mb: 2,
          }}
        >
          Variants (Size: SM)
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="warning">Warning</Badge>
        </Box>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h2"
          sx={{
            color: theme.palette.text.primary,
            mb: 2,
          }}
        >
          Sizes (Primary)
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
          <Badge size="xs" variant="primary">
            Extra Small
          </Badge>
          <Badge size="sm" variant="primary">
            Small (default)
          </Badge>
          <Badge size="md" variant="primary">
            Medium
          </Badge>
        </Box>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h2"
          sx={{
            color: theme.palette.text.primary,
            mb: 2,
          }}
        >
          With Icons
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          <Badge variant="success" icon={CheckCircle}>
            Completato
          </Badge>
          <Badge variant="warning" icon={AlertCircle}>
            Attenzione
          </Badge>
          <Badge variant="info" icon={Info}>
            Informazione
          </Badge>
          <Badge variant="primary" icon={Zap}>
            Premium
          </Badge>
        </Box>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h2"
          sx={{
            color: theme.palette.text.primary,
            mb: 2,
          }}
        >
          Icons + Different Sizes
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          <Badge size="xs" variant="primary" icon={Star}>
            XS
          </Badge>
          <Badge size="sm" variant="primary" icon={Star}>
            SM
          </Badge>
          <Badge size="md" variant="primary" icon={Star}>
            MD
          </Badge>
        </Box>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h2"
          sx={{
            color: theme.palette.text.primary,
            mb: 2,
          }}
        >
          Removable
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          {removableStates.info && (
            <Badge
              variant="info"
              removable
              onRemove={() => handleRemove('info')}
            >
              Dismissible Info
            </Badge>
          )}
          {removableStates.warning && (
            <Badge
              variant="warning"
              icon={AlertCircle}
              removable
              onRemove={() => handleRemove('warning')}
            >
              Warning with Icon
            </Badge>
          )}
          {removableStates.success && (
            <Badge
              size="md"
              variant="success"
              icon={CheckCircle}
              removable
              onRemove={() => handleRemove('success')}
            >
              Completed Task
            </Badge>
          )}
        </Box>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h2"
          sx={{
            color: theme.palette.text.primary,
            mb: 2,
          }}
        >
          Complex Examples
        </Typography>
        <Box sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            <Badge variant="secondary" size="xs">
              v2.1.0
            </Badge>
            <Badge variant="success" size="xs" icon={CheckCircle}>
              Active
            </Badge>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          <Badge variant="primary" icon={Zap}>
            New Feature
          </Badge>
          <Badge variant="danger" icon={Trash2}>
            Beta
          </Badge>
        </Box>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h2"
          sx={{
            color: theme.palette.text.primary,
            mb: 2,
          }}
        >
          All Combinations
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          {(['xs', 'sm', 'md'] as const).map((size) => (
            <Box key={size} sx={{ mb: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  mb: 0.5,
                  display: 'block',
                }}
              >
                Size: {size}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Badge size={size} variant="primary">
                  Primary
                </Badge>
                <Badge size={size} variant="secondary">
                  Secondary
                </Badge>
                <Badge size={size} variant="danger">
                  Danger
                </Badge>
                <Badge size={size} variant="success">
                  Success
                </Badge>
                <Badge size={size} variant="info">
                  Info
                </Badge>
                <Badge size={size} variant="warning">
                  Warning
                </Badge>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}