"use client";

import { useState } from 'react';
import Icon, { Hash, User } from '@/common/components/ui/Icon';
import { Box, Typography, useTheme } from '@mui/material';

import SmartModal from '@/common/components/common/SmartModal';
import { useFormModal } from '@/common/hooks/useFormModal';
import FormInput from '@/common/components/forms/FormInput';
import FormSelect from '@/common/components/forms/FormSelect';

interface StaffMember {
  id: number;
  name: string;
  type: 'COLLABORATORE' | 'APPRENDISTA';
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

export default function SaleModal({ isOpen, onClose, cream, teamMembers, onSubmit }: SaleModalProps) {
  const theme = useTheme();
  const [selectedArtistId, setSelectedArtistId] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const handleClose = () => {
    onClose();
    setSelectedArtistId(0);
    setQuantity(1);
  };

  const { isLoading, handleSubmit } = useFormModal({
    initial: {},
    onSubmit: async () => {
      await onSubmit(selectedArtistId, quantity);
      setSelectedArtistId(0);
      setQuantity(1);
    },
    onClose,
    successMessage: 'Vendita registrata',
    errorMessage: 'Errore durante la registrazione della vendita',
  });

  const handleSave = async () => {
    if (!selectedArtistId) return;
    await handleSubmit();
  };

  const staffOptions = (teamMembers || []).map(m => ({
    value: m.id,
    label: `${m.name} (${m.type === 'APPRENDISTA' ? 'Apprendista' : 'Collaboratore'})`
  }));

  return (
    <SmartModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Registra Vendita Crema"
      onSave={handleSave}
      isSaving={isLoading}
      saveLabel="Registra Vendita"
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
            border: `1px solid ${theme.palette.primary.main}20`,
            backgroundColor: `${theme.palette.primary.main}08`,
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
              backgroundColor: `${theme.palette.primary.main}15`,
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
          value={selectedArtistId}
          onChange={(v) => setSelectedArtistId(Number(v))}
          options={staffOptions}
          placeholder="Seleziona artista..."
          icon={User}
          required
        />

        <FormInput
          label="Quantità"
          type="number"
          value={quantity}
          onChange={(v) => setQuantity(Math.max(1, Number(v)))}
          icon={Hash}
          required
        />
      </Box>
    </SmartModal>
  );
}
