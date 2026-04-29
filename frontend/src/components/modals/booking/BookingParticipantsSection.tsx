"use client";

import FormSelect from '@/components/forms/FormSelect';
import { Box, useTheme } from '@mui/material';
import { Users } from 'lucide-react';

interface CustomerOption { value: string; label: string; }
interface ArtistOption { value: string; label: string; }

interface Props {
  date: string;
  time: string;
  customerId: string;
  artistId: string;
  loadingCustomers?: boolean;
  loadingArtists: boolean;
  customerOptions: CustomerOption[];
  artistOptions: ArtistOption[];
  noArtistAvailable: boolean;
  onCustomerChange: (value: string) => void;
  onArtistChange: (value: string) => void;
}

export default function BookingParticipantsSection({
  date,
  time,
  customerId,
  artistId,
  loadingCustomers = false,
  loadingArtists,
  customerOptions,
  artistOptions,
  noArtistAvailable,
  onCustomerChange,
  onArtistChange,
}: Props) {
  const theme = useTheme();
  const hasDateTime = Boolean(date && time);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        transition: 'all 0.3s ease',
        opacity: !hasDateTime ? 0.4 : 1,
        pointerEvents: !hasDateTime ? 'none' : 'auto'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Users size={14} style={{ color: theme.palette.primary.main }} />
        <Box
          component="span"
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 'bold',
            color: theme.palette.primary.main,
            textTransform: 'uppercase',
            letterSpacing: '0.08em'
          }}
        >
          Chi coinvolge
        </Box>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
        <FormSelect
          label="Cliente *"
          value={customerId}
          onChange={onCustomerChange}
          disabled={loadingCustomers || customerOptions.length === 0}
          placeholder={loadingCustomers ? 'Caricamento clienti...' : customerOptions.length === 0 ? 'Nessun cliente' : 'Seleziona...'}
          required
          options={customerOptions}
        />
        <FormSelect
          label="Artista *"
          value={artistId}
          onChange={onArtistChange}
          disabled={loadingArtists || artistOptions.length === 0}
          placeholder={loadingArtists ? 'Ricerca...' : artistOptions.length === 0 ? 'Nessun artista' : 'Seleziona...'}
          required
          options={artistOptions}
        />
      </Box>
      {hasDateTime && noArtistAvailable && !loadingArtists && (
        <Box
          sx={{
            fontSize: '0.6875rem',
            color: 'rgba(244, 67, 54, 0.8)',
            fontStyle: 'italic'
          }}
        >
          Nessun artista disponibile in questo orario.
        </Box>
      )}
    </Box>
  );
}
