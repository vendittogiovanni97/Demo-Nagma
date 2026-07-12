"use client";

import { useState, useEffect } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { useAuth } from '@/common/context/AuthContext';
import { useFormModal } from '@/common/hooks/useFormModal';
import { staffApi } from '@/modules/staff/api/staff.api';
import type { Staff } from '@/modules/staff/model/staff.types';
import StatePanel from '@/common/components/feedback/StatePanel';
import Avatar from '@/common/components/data-display/Avatar';
import SmartModal from '@/common/components/common/SmartModal';
import FormInput from '@/common/components/forms/FormInput';
import FormSelect from '@/common/components/forms/FormSelect';

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
  const { isAdmin } = useAuth();
  const theme = useTheme();
  
  const [name, setName] = useState('');
  const [type, setType] = useState<StaffTypeValue>('COLLABORATORE');
  const [color, setColor] = useState(COLOR_PRESETS[0]);

  const isEditing = !!member;

  useEffect(() => {
    if (isOpen) {
      setName(member?.name || '');
      setType(member?.type || 'COLLABORATORE');
      setColor(member?.color || COLOR_PRESETS[0]);
    }
  }, [isOpen, member]);

  const { isLoading, handleSubmit } = useFormModal({
    onSubmit: async () => {
      const payload = { name, type, color };
      if (isEditing) {
        await staffApi.update(member!.id, payload);
      } else {
        await staffApi.create(payload);
      }
      onSuccess();
    },
    onClose,
    successMessage: isEditing ? 'Membro modificato' : 'Membro creato',
    errorMessage: isEditing ? 'Errore durante la modifica' : 'Errore durante la creazione',
  });

  const handleSave = async () => {
    await handleSubmit();
  };

  return (
    <SmartModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Modifica Membro' : 'Nuovo Membro'}
      onSave={handleSave}
      isSaving={isLoading}
      saveLabel={isEditing ? 'Salva Modifiche' : 'Crea Membro'}
      maxWidth="sm"
    >
      {!isAdmin ? (
        <StatePanel
          variant="error"
          title="Permessi insufficienti"
          description="Solo un admin può gestire i componenti del team."
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Avatar Preview */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: alpha(theme.palette.common.white, 0.03),
            }}
          >
            <Avatar 
              name={name || 'M'} 
              color={color} 
              size="lg" 
              sx={{ cursor: 'default', '&:hover': { transform: 'none' } }} 
            />
            <Box>
              <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: theme.palette.text.primary }}>
                {name.trim() || 'Nuovo membro'}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>
                {TYPE_OPTIONS.find((option) => option.value === type)?.label ?? 'Collaboratore'}
              </Typography>
            </Box>
          </Box>

          <FormInput
            label="Nome Completo"
            value={name}
            onChange={setName}
            placeholder="Inserisci il nome..."
            required
          />

          <FormSelect
            label="Ruolo"
            value={type}
            onChange={(val) => setType(val as StaffTypeValue)}
            options={TYPE_OPTIONS}
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
              Colore Profilo
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
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
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      border: isSelected ? `2px solid ${theme.palette.common.white}` : `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
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
          </Box>
        </Box>
      )}
    </SmartModal>
  );
}
