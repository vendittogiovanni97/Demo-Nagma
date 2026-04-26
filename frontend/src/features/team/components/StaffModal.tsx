"use client";

import StatePanel from '@/components/feedback/StatePanel';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';
import { createStaffSchema } from '@/schemas/staff';
import { staffService } from '@/services/staff.service';
import { extractErrorMessage } from '@/utils/extract-error';
import { validateData } from '@/utils/validation';
import { useState } from 'react';
import { Box, MenuItem, TextField, Typography, useTheme } from '@mui/material';
import Avatar from '@/components/data-display/Avatar';
import SubmitButton from '@/components/forms/SubmitButton';
import Modal from '@/components/modals/Modal';

const STAFF_TYPE_OPTIONS = [
  { value: 'COLLABORATORE', label: 'Collaboratore' },
  { value: 'APPRENDISTA', label: 'Apprendista' },
] as const;

const STAFF_COLOR_PRESETS = ['#00BFFF', '#4F7CFF', '#25D366', '#FF6B6B', '#FFB020', '#9B6DFF'] as const;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function StaffModal({ isOpen, onClose }: Props) {
  const toast = useToast();
  const { isAdmin } = useAuth();
  const theme = useTheme();
  const [name, setName] = useState('');
  const [type, setType] = useState('COLLABORATORE');
  const [color, setColor] = useState(() => theme.palette.primary.main);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, type, color };
    const validationError = validateData(createStaffSchema, payload);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);
    try {
      await staffService.create(payload);
      toast.success(`${name} aggiunto al team!`);
      setName('');
      setType('COLLABORATORE');
      setColor(theme.palette.primary.main);
      onClose();
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, 'Errore durante l\'inserimento'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Aggiungi Staff" maxWidth="sm">
      {!isAdmin ? (
        <StatePanel
          variant="error"
          title="Permessi insufficienti"
          description="Solo un admin può creare nuovi membri dello staff."
        />
      ) : (
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '1px' }} onSubmit={handleSubmit}>
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
            <Avatar
              name={name || 'S'}
              color={color}
              size="lg"
              sx={{ cursor: 'default', '&:hover': { transform: 'none' } }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: theme.palette.text.primary }}>
                {name.trim() || 'Nuovo membro staff'}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>
                {STAFF_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? 'Collaboratore'}
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
            <Typography sx={fieldLabelSx}>Tipo</Typography>
            <TextField
              select
              value={type}
              onChange={(e) => setType(e.target.value)}
              size="small"
              fullWidth
              sx={inputSx}
            >
              {STAFF_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography component="label" htmlFor="staff-color" sx={fieldLabelSx}>
              Colore Calendario
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {STAFF_COLOR_PRESETS.map((preset) => {
                const isSelected = color.toUpperCase() === preset.toUpperCase();
                return (
                  <Box
                    key={preset}
                    component="button"
                    type="button"
                    onClick={() => setColor(preset)}
                    aria-label={`Seleziona colore ${preset}`}
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

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.25,
                borderRadius: 1.5,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
              }}
            >
              <Box
                component="input"
                id="staff-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                sx={{
                  width: 44,
                  height: 44,
                  p: 0,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1.5,
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  overflow: 'hidden',
                }}
              />

              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: theme.palette.text.primary }}>
                  {color.toUpperCase()}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>
                  Usato per distinguere gli appuntamenti in agenda
                </Typography>
              </Box>
            </Box>
          </Box>

          <SubmitButton loading={loading} label="Crea Profilo Staff" />
        </Box>
      )}
    </Modal>
  );
}
