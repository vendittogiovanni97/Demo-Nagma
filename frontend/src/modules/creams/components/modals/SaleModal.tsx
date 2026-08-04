"use client";

import Icon, { Hash, User } from '@/common/components/ui/Icon';
import { Box, Typography, useTheme, alpha } from '@mui/material';

import FormModal from '@/common/components/common/FormModal';
import { useEntityForm } from '@/common/hooks/useEntityForm';
import FormInput from '@/common/components/forms/FormInput';
import FormSelect from '@/common/components/forms/FormSelect';

import type { StaffType } from '@/common/shared/types/enums';

interface StaffMember {
  id: number;
  name: string;
  type: StaffType;
  color?: string;
}

interface CreamInfo {
  id: number;
  name: string;
  description: string | null;
}

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  cream: CreamInfo | null | undefined;
  teamMembers: StaffMember[] | null | undefined;
  onSubmit: (artistId: number, quantity: number) => Promise<void>;
}

interface SaleFormData {
  artistId: number;
  quantity: number;
}

export default function SaleModal({ isOpen, onClose, cream, teamMembers, onSubmit }: SaleModalProps) {
  const theme = useTheme();

  const form = useEntityForm<null, SaleFormData>({
    entity: null,
    open: isOpen,
    initial: () => ({
      artistId: 0,
      quantity: 1,
    }),
    buildPayload: (data) => data,
    persist: async (payload) => {
      if (!payload.artistId) {
        throw new Error('Seleziona un artista');
      }
      await onSubmit(payload.artistId, payload.quantity);
    },
    successMessage: 'Vendita registrata',
    onClose,
  });

  const { formData, setField, isLoading } = form;

  const staffOptions = (teamMembers || []).map(m => ({
    value: m.id,
    label: `${m.name} (${m.type === 'APPRENDISTA' ? 'Apprendista' : 'Collaboratore'})`
  }));

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Registra Vendita Crema"
      onSubmit={() => form.handleSubmit()}
      isSubmitting={isLoading}
      submitLabel="Registra Vendita"
      maxWidth="sm"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Prodotto Info */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 1.5,
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
            }}
          >
            <Icon name="package" size={20} color={theme.palette.primary.main} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Prodotto Selezionato
            </Typography>
            <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: theme.palette.text.primary }}>
              {cream?.name}
            </Typography>
          </Box>
        </Box>

        <FormSelect
          label="Artista"
          value={formData.artistId}
          onChange={(v) => setField('artistId', Number(v))}
          options={staffOptions}
          placeholder="Seleziona artista..."
          icon={User}
          required
        />

        <FormInput
          label="Quantità"
          type="number"
          value={formData.quantity}
          onChange={(v) => setField('quantity', Math.max(1, Number(v)))}
          icon={Hash}
          required
        />
      </Box>
    </FormModal>
  );
}
