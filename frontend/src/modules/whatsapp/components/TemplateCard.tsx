"use client";

import Icon from '@/common/components/ui/Icon';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import Button from '@/common/components/ui/Button';
import type { WhatsAppTemplate } from '../model/whatsapp.types';

interface TemplateCardProps {
  template: WhatsAppTemplate;
  onEdit: (t: WhatsAppTemplate) => void;
  onDelete: (id: number) => void;
}

export default function TemplateCard({ template, onEdit, onDelete }: TemplateCardProps) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const variables = template.body.match(/\{\{([^}]+)\}\}/g) || [];

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: 1,
        borderColor: 'divider',
        backgroundColor: isLight ? alpha(theme.palette.common.black, 0.02) : alpha(theme.palette.common.white, 0.05),
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'default',
        boxShadow: isLight ? `0 1px 2px ${alpha(theme.palette.common.black, 0.05)}` : 'none',
        '&:hover': {
          backgroundColor: isLight ? alpha(theme.palette.common.black, 0.04) : alpha(theme.palette.common.white, 0.08),
          boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, isLight ? 0.08 : 0.2)}`,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 1.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
            {template.name}
          </Typography>
          {!template.isActive && (
            <Typography
              sx={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'warning.main',
                mt: 0.5,
              }}
            >
              Inattivo
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="icon"
            icon={<Icon name="edit" size={18} />}
            title="Modifica"
            onClick={() => onEdit(template)}
          />
          <Button
            variant="icon"
            icon={<Icon name="trash2" size={18} />}
            sx={{
              color: 'error.main',
              opacity: 0.6,
              '&:hover': {
                color: 'error.main',
                backgroundColor: alpha(theme.palette.error.main, 0.1),
              },
            }}
            title="Elimina"
            onClick={() => onDelete(template.id)}
          />
        </Box>
      </Box>

      <Box
        sx={{
          backgroundColor: isLight ? alpha(theme.palette.common.black, 0.03) : alpha(theme.palette.common.black, 0.2),
          borderRadius: 2,
          p: 2,
          flex: 1,
          fontSize: '0.875rem',
          color: 'text.secondary',
          fontStyle: 'italic',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 6,
          WebkitBoxOrient: 'vertical',
          mb: 1.5,
        }}
      >
        {template.body}
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 'auto',
          borderTop: 1,
          borderColor: 'divider',
          pt: 1.5,
        }}
      >
        <Box sx={{ fontSize: '0.75rem', color: 'text.secondary', display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {variables.map((variable, i) => (
            <Box
              key={i}
              sx={{
                px: 0.75,
                py: 0.25,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                borderRadius: 1,
              }}
            >
              {variable}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
