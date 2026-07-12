"use client";

import StatePanel from '@/common/components/feedback/StatePanel';
import { useAuth } from '@/common/context/AuthContext';
import { useFormModal } from '@/common/hooks/useFormModal';
import { useToast } from '@/common/hooks/useToast';
import { createStaffSchema } from '@/modules/staff/model/staff.schema';
import { staffApi } from '@/modules/staff/api/staff.api';
import { validateData } from '@/common/shared/utils/validation';
import { useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import SmartModal from '@/common/components/common/SmartModal';
import Avatar from '@/common/components/data-display/Avatar';
import FormInput from '@/common/components/forms/FormInput';
import FormSelect from '@/common/components/forms/FormSelect';
import Icon from '@/common/components/ui/Icon';

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

  const { isLoading, handleSubmit } = useFormModal({
    onSubmit: async () => {
      const payload = { name, type, color };
      await staffApi.create(payload);
      setName('');
      setType('COLLABORATORE');
      setColor(theme.palette.primary.main);
    },
    onClose,
    successMessage: `${name} aggiunto al team!`,
    errorMessage: "Errore durante l'inserimento",
  });

  const handleSave = async () => {
    const payload = { name, type, color };
    const validationError = validateData(createStaffSchema, payload);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    await handleSubmit();
  };

  return (
    <SmartModal
      isOpen={isOpen}
      onClose={onClose}
      title="Aggiungi Staff"
      maxWidth="sm"
      onSave={handleSave}
      isSaving={isLoading}
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
              backgroundColor: alpha(theme.palette.common.white, 0.03),
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
              component="label"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: alpha(theme.palette.common.white, 0.02),
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.common.white, 0.05),
                  borderColor: color,
                  boxShadow: `0 0 15px ${color}1a`,
                }
              }}
            >
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{
                  position: 'absolute',
                  width: 0,
                  height: 0,
                  opacity: 0,
                  pointerEvents: 'none'
                }}
              />

              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  backgroundColor: color,
                  border: `2px solid ${alpha(theme.palette.common.white, 0.2)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 12px ${color}4d`,
                  flexShrink: 0,
                  transition: 'transform 0.2s',
                }}
              >
                <Box sx={{ color: theme.palette.common.white, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))', display: 'inline-flex' }}>
                  <Icon name="palette" size={18} />
                </Box>
              </Box>

              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: theme.palette.text.primary, fontFamily: 'Outfit', mb: 0.25 }}>
                  Colore Personalizzato: <span style={{ color: color, fontFamily: 'monospace', fontWeight: 900 }}>{color.toUpperCase()}</span>
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>
                  Clicca qui per aprire la tavolozza dei colori completa
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </SmartModal>
  );
}
