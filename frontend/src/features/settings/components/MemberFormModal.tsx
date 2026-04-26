"use client";

import { useState } from 'react';
import { Box, MenuItem, TextField, Typography, useTheme } from '@mui/material';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';
import { teamService } from '@/services/team.service';
import type { Staff } from '@/types/team';
import { extractErrorMessage } from '@/utils/extract-error';
import StatePanel from '@/components/feedback/StatePanel';
import SubmitButton from '@/components/forms/SubmitButton';
import Avatar from '@/components/data-display/Avatar';
import Modal from '@/components/modals/Modal';

const TYPE_OPTIONS = [
  { value: 'COLLABORATORE', label: 'Collaboratore' },
  { value: 'APPRENDISTA', label: 'Apprendista' },
] as const;

type StaffTypeValue = (typeof TYPE_OPTIONS)[number]['value'];

const COLOR_PRESETS = ['#4ec9e0', '#ff6b6b', '#a78bfa', '#34d399', '#fbbf24', '#f87171'];

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  member?: Staff | null;
}

export default function MemberFormModal({ isOpen, onClose, onSuccess, member }: MemberFormModalProps) {
  const toast = useToast();
  const { isAdmin } = useAuth();
  const theme = useTheme();
  const [name, setName] = useState(member?.name || '');
  const [type, setType] = useState<StaffTypeValue>(member?.type || 'COLLABORATORE');
  const [color, setColor] = useState(member?.color || COLOR_PRESETS[0]);
  const [loading, setLoading] = useState(false);

  const isEditing = !!member;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name, type, color };

      if (isEditing) {
        await teamService.updateMember(member!.id, payload);
        toast.success('Membro modificato');
      } else {
        await teamService.createMember(payload);
        toast.success('Membro creato');
      }
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error, isEditing ? 'Errore durante la modifica' : 'Errore durante la creazione');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Componente Team" maxWidth="sm">
        <StatePanel
          variant="error"
          title="Permessi insufficienti"
          description="Solo un admin può gestire i componenti del team."
        />
      </Modal>
    );
  }

  const fieldLabelSx = {
    px: 0.5,
    fontSize: '0.75rem',
    fontWeight: 600,
    color: theme.palette.primary.main,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  } as const;

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 1.5,
      fontSize: '0.9375rem',
    },
  } as const;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Modifica Membro' : 'Nuovo Membro'} maxWidth="sm">
      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} onSubmit={handleSubmit}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            borderRadius: 1.5,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
          }}
        >
          <Avatar name={name || 'M'} color={color} size="lg" sx={{ cursor: 'default', '&:hover': { transform: 'none' } }} />
          <Box>
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: theme.palette.text.primary }}>
              {name.trim() || 'Nuovo membro'}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>
              {TYPE_OPTIONS.find((option) => option.value === type)?.label ?? 'Collaboratore'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Typography sx={fieldLabelSx}>Nome</Typography>
          <TextField
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome del collaboratore..."
            size="small"
            fullWidth
            sx={inputSx}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Typography sx={fieldLabelSx}>Ruolo/Tipo</Typography>
          <TextField select value={type} onChange={(e) => setType(e.target.value as StaffTypeValue)} size="small" fullWidth sx={inputSx}>
            {TYPE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography sx={fieldLabelSx}>Colore</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
            {COLOR_PRESETS.map((preset) => {
              const isSelected = color.toUpperCase() === preset.toUpperCase();
              return (
                <Box
                  key={preset}
                  component="button"
                  type="button"
                  onClick={() => setColor(preset)}
                  title={preset}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    border: isSelected ? `2px solid ${theme.palette.common.white}` : `1px solid ${theme.palette.divider}`,
                    outline: isSelected ? `2px solid ${preset}` : 'none',
                    outlineOffset: 1,
                    backgroundColor: preset,
                    cursor: 'pointer',
                  }}
                />
              );
            })}
          </Box>
        </Box>

        <SubmitButton loading={loading} label={isEditing ? 'Salva Modifiche' : 'Crea Membro'} />
      </Box>
    </Modal>
  );
}
