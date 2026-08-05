"use client";

import { Box, Stack, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { WHATSAPP_QUICK_VARIABLES, type QuickVariable } from '../model/whatsapp.constants';

interface QuickVariablesBarProps {
  onInsertVariable: (variableValue: string) => void;
  variables?: QuickVariable[];
}

export function QuickVariablesBar({
  onInsertVariable,
  variables = WHATSAPP_QUICK_VARIABLES,
}: QuickVariablesBarProps) {
  const theme = useTheme();

  return (
    <Box sx={{ mb: 1 }}>
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary', mb: 0.75 }}>
        Inserisci Variabile Rapida:
      </Typography>
      <Stack direction="row" useFlexGap sx={{ gap: 1, flexWrap: 'wrap' }}>
        {variables.map((v) => (
          <Box
            key={v.value}
            component="button"
            type="button"
            onClick={() => onInsertVariable(v.value)}
            sx={{
              px: 1.25,
              py: 0.5,
              borderRadius: 1.5,
              border: `1px solid ${alpha(v.color || theme.palette.primary.main, 0.3)}`,
              backgroundColor: alpha(v.color || theme.palette.primary.main, 0.08),
              color: 'text.primary',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: alpha(v.color || theme.palette.primary.main, 0.18),
                borderColor: v.color || theme.palette.primary.main,
                transform: 'translateY(-1px)',
              },
            }}
          >
            {v.label}
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
