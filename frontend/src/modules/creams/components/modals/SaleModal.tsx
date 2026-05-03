"use client";

import { useState } from 'react';
import { Package, Hash, User } from 'lucide-react';
import { Box, Typography, useTheme } from '@mui/material';

import SmartModal from '@/components/common/SmartModal';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';

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
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    onClose();
    setSelectedArtistId(0);
    setQuantity(1);
  };

  const handleSave = async () => {
    if (!selectedArtistId) return;
    setLoading(true);
    try {
      await onSubmit(selectedArtistId, quantity);
      handleClose();
    } finally {
      setLoading(false);
    }
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
      isSaving={loading}
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
            <Package size={20} color={theme.palette.primary.main} />
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
