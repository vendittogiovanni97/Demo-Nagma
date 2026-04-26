'use client';

import { useState } from 'react';
import { Package, User, Hash } from 'lucide-react';
import { Box, FormControl, Input, Select, MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import Button from '@/components/ui/Button';
import Modal from '@/components/modals/Modal';

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
  cream: CreamInfo | undefined;
  teamMembers: StaffMember[] | undefined;
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

  const handleSubmit = async () => {
    if (!selectedArtistId) return;
    setLoading(true);
    try {
      await onSubmit(selectedArtistId, quantity);
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Registra Vendita" maxWidth="sm">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 2,
            bgcolor: 'rgba(255,255,255,0.05)',
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Package size={20} color={theme.palette.primary.main} />
          <Box sx={{ color: theme.palette.text.primary, fontWeight: 500 }}>
            {cream?.name}
          </Box>
        </Box>

        <Box>
          <Box
            component="label"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              fontSize: '0.875rem',
              fontWeight: 500,
              color: theme.palette.text.secondary,
              mb: 1,
            }}
          >
            <User size={14} />
            Artista
          </Box>
          <FormControl fullWidth size="small">
            <Select
              value={selectedArtistId}
              onChange={(e) => setSelectedArtistId(Number(e.target.value))}
              sx={{
                bgcolor: 'rgba(255,255,255,0.05)',
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                color: theme.palette.text.primary,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                '&:focus': { borderColor: theme.palette.primary.main },
              }}
            >
              <MenuItem value={0}>Seleziona artista...</MenuItem>
              {teamMembers?.map((member) => (
                <MenuItem key={member.id} value={member.id}>
                  {member.name} ({member.type === 'APPRENDISTA' ? 'Apprendista' : 'Collaboratore'})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box>
          <Box
            component="label"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              fontSize: '0.875rem',
              fontWeight: 500,
              color: theme.palette.text.secondary,
              mb: 1,
            }}
          >
            <Hash size={14} />
            Quantità
          </Box>
          <Input
            type="number"
            inputProps={{ min: 1 }}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            fullWidth
            disableUnderline
            sx={{
              bgcolor: 'rgba(255,255,255,0.05)',
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              px: 2,
              py: 1.5,
              color: theme.palette.text.primary,
              fontFamily: 'monospace',
              fontSize: '1.125rem',
              textAlign: 'center',
              '&:focus': { borderColor: theme.palette.primary.main },
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, pt: 0.5 }}>
          <Button variant="secondary" onClick={handleClose} sx={{ flex: 1 }}>
            Annulla
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!selectedArtistId || loading} sx={{ flex: 1 }}>
            Registra
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}