"use client";

import StatePanel from '@/common/components/feedback/StatePanel';
import { useAuth } from '@/common/context/AuthContext';
import { useEntityForm } from '@/common/hooks/useEntityForm';
import { createStaffSchema } from '@/modules/staff/model/staff.schema';
import { staffApi } from '@/modules/staff/api/staff.api';
import type { Staff, StaffType } from '@/modules/staff/model/staff.types';
import { validateData } from '@/common/shared/utils/validation';
import { Box, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import FormModal from '@/common/components/common/FormModal';
import Avatar from '@/common/components/ui/Avatar';
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
  onSuccess?: () => void;
  member?: Staff | null;
}

interface StaffFormData {
  name: string;
  type: StaffType;
  color: string;
}

export default function StaffModal({ isOpen, onClose, onSuccess, member }: Props) {
  const { isAdmin } = useAuth();
  const theme = useTheme();
  const isEditing = member !== null && member !== undefined;

  const form = useEntityForm<Staff | null, StaffFormData>({
    entity: member ?? null,
    open: isOpen,
    initial: (entity) => ({
      name: entity?.name ?? '',
      type: entity?.type ?? 'COLLABORATORE',
      color: entity?.color ?? theme.palette.primary.main,
    }),
    buildPayload: (data) => data,
    persist: async (payload, entity) => {
      const validationError = validateData(createStaffSchema, payload);
      if (validationError) {
        throw new Error(validationError);
      }
      if (entity) {
        await staffApi.update(entity.id, payload);
      } else {
        await staffApi.create(payload);
      }
    },
    successMessage: isEditing ? 'Staff modificato con successo!' : 'Staff aggiunto al team!',
    onSuccess,
    onClose,
  });

  const { formData, setField, isLoading } = form;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Modifica Staff' : 'Aggiungi Staff'}
      maxWidth="sm"
      onSubmit={() => form.handleSubmit()}
      isSubmitting={isLoading}
      submitLabel={isEditing ? 'Salva Modifiche' : 'Crea Profilo Staff'}
    >
      {!isAdmin ? (
        <StatePanel
          variant="error"
          title="Permessi insufficienti"
          description="Solo un admin può gestire i membri dello staff."
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
              name={formData.name || 'S'}
              color={formData.color}
              size="lg"
              sx={{ cursor: 'default', '&:hover': { transform: 'none' } }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: theme.palette.text.primary }}>
                {formData.name.trim() || (isEditing ? 'Membro staff' : 'Nuovo membro staff')}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>
                {STAFF_TYPE_OPTIONS.find((option) => option.value === formData.type)?.label ?? 'Collaboratore'}
              </Typography>
            </Box>
          </Box>

          <FormInput
            label="Nome"
            value={formData.name}
            onChange={(val) => setField('name', val)}
            placeholder="Nome del collaboratore..."
            required
          />

          <FormSelect
            label="Tipo"
            value={formData.type}
            onChange={(val) => setField('type', val as StaffType)}
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
                const isSelected = formData.color.toUpperCase() === preset.toUpperCase();
                return (
                  <Box
                    key={preset}
                    component="button"
                    type="button"
                    onClick={() => setField('color', preset)}
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
                  borderColor: formData.color,
                  boxShadow: `0 0 15px ${alpha(formData.color, 0.1)}`,
                }
              }}
            >
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setField('color', e.target.value)}
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
                  backgroundColor: formData.color,
                  border: `2px solid ${alpha(theme.palette.common.white, 0.2)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 12px ${alpha(formData.color, 0.3)}`,
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
                  Colore Personalizzato: <span style={{ color: formData.color, fontFamily: 'monospace', fontWeight: 900 }}>{formData.color.toUpperCase()}</span>
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>
                  Clicca qui per aprire la tavolozza dei colori completa
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </FormModal>
  );
}
