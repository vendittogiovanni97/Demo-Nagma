"use client";

import StatePanel from '@/components/feedback/StatePanel';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';
import { createStaffSchema } from '@/schemas/staff';
import { staffService } from '@/services/staff.service';
import { extractErrorMessage } from '@/utils/extract-error';
import { validateData } from '@/utils/validation';
import { useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import SmartModal from '@/components/common/SmartModal';
import Avatar from '@/components/data-display/Avatar';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';

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

  const handleSave = async () => {
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
    <SmartModal
      isOpen={isOpen}
      onClose={onClose}
      title="Aggiungi Staff"
      maxWidth="sm"
      onSave={handleSave}
      isSaving={loading}
      saveLabel="Crea Profilo Staff"
    >
      {!isAdmin ? (
        <StatePanel
          variant="error"
          title="Permessi insufficienti"
          description="Solo un admin può creare nuovi membri dello staff."
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 2,
              borderRadius: 2,
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

          <FormInput
            label="Nome"
            value={name}
            onChange={setName}
            placeholder="Nome del collaboratore..."
            required
          />

          <FormSelect
            label="Tipo"
            value={type}
            onChange={setType}
            options={STAFF_TYPE_OPTIONS}
            required
          />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography sx={{ 
              fontSize: '0.75rem', 
              fontWeight: 600, 
              color: theme.palette.primary.main,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              px: 0.5 
            }}>
              Colore Calendario
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
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
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      border: isSelected ? `2px solid ${theme.palette.common.white}` : `1px solid ${theme.palette.divider}`,
                      outline: isSelected ? `2px solid ${preset}` : 'none',
                      outlineOffset: 1,
                      backgroundColor: preset,
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'scale(1.1)' }
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
                p: 1.5,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
              }}
            >
              <Box
                component="input"
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
        </Box>
      )}
    </SmartModal>
  );
}
