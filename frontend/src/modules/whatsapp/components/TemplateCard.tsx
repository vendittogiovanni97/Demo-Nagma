"use client";

import { Edit, Trash2 } from 'lucide-react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import Button from '@/components/ui/Button';
import type { WhatsAppTemplate } from '../model/whatsapp.types';

interface TemplateCardProps {
  template: WhatsAppTemplate;
  onEdit: (t: WhatsAppTemplate) => void;
  onDelete: (id: number) => void;
}

export default function TemplateCard({ template, onEdit, onDelete }: TemplateCardProps) {
  const variables = template.body.match(/\{\{([^}]+)\}\}/g) || [];

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: 1,
        borderColor: 'divider',
        backgroundColor: 'rgba(255,255,255,0.05)',
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'default',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        '&:hover': {
          backgroundColor: 'rgba(255,255,255,0.1)',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 1.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: 'white', lineHeight: 1.2 }}>
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
            icon={<Edit size={18} />}
            title="Modifica"
            onClick={() => onEdit(template)}
          />
          <Button
            variant="icon"
            icon={<Trash2 size={18} />}
            sx={{
              color: 'error.main',
              opacity: 0.6,
              '&:hover': {
                color: 'error.main',
                backgroundColor: 'rgba(244,67,54,0.1)',
              },
            }}
            title="Elimina"
            onClick={() => onDelete(template.id)}
          />
        </Box>
      </Box>

      <Box
        sx={{
          backgroundColor: 'rgba(0,0,0,0.2)',
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
          borderColor: 'rgba(255,255,255,0.08)',
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
                backgroundColor: 'rgba(0,191,255,0.1)',
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
