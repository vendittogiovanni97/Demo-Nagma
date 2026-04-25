"use client";

import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import { PERCENTUALE_OPTIONS } from '@/config/booking-config';
import { Box, useTheme } from '@mui/material';
import { Banknote } from 'lucide-react';

interface Props {
  price: string;
  deposit: string;
  percentualeMode: string;
  customPercentuale: string;
  prezzoArtista: number;
  guadagno: number;
  onPriceChange: (value: string) => void;
  onDepositChange: (value: string) => void;
  onPercentualeModeChange: (value: string) => void;
  onCustomPercentualeChange: (value: string) => void;
}

export default function BookingFinancialSection({
  price,
  deposit,
  percentualeMode,
  customPercentuale,
  prezzoArtista,
  guadagno,
  onPriceChange,
  onDepositChange,
  onPercentualeModeChange,
  onCustomPercentualeChange,
}: Props) {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Banknote size={14} style={{ color: theme.palette.primary.main }} />
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
          Economico
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' },
          gap: 1.5,
          alignItems: 'flex-end'
        }}
      >
        <FormInput label="Prezzo (€)" type="number" value={price} onChange={onPriceChange} placeholder="0.00" min={0} step="0.01" />
        <FormInput label="Acconto (€)" type="number" value={deposit} onChange={onDepositChange} placeholder="0.00" min={0} step="0.01" />
        <FormSelect
          label="% Artista"
          value={percentualeMode}
          onChange={onPercentualeModeChange}
          options={PERCENTUALE_OPTIONS}
        />
        {percentualeMode === 'custom' ? (
          <FormInput
            label="% libera"
            type="number"
            value={customPercentuale}
            onChange={onCustomPercentualeChange}
            placeholder="35"
            min={0}
            max={100}
          />
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                px: 1.5,
                py: 1.25,
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                border: '1px solid rgba(255, 152, 0, 0.2)'
              }}
            >
              <Box
                sx={{
                  fontSize: '0.5625rem',
                  color: '#ffb74d',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  mb: 0.5
                }}
              >
                Artista
              </Box>
              <Box
                sx={{
                  fontSize: '1rem',
                  fontFamily: 'Outfit',
                  fontWeight: 900,
                  color: '#ffb74d'
                }}
              >
                €{prezzoArtista.toFixed(2)}
              </Box>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                px: 1.5,
                py: 1.25,
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                border: '1px solid rgba(76, 175, 80, 0.2)'
              }}
            >
              <Box
                sx={{
                  fontSize: '0.5625rem',
                  color: '#66bb6a',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  mb: 0.5
                }}
              >
                Studio
              </Box>
              <Box
                sx={{
                  fontSize: '1rem',
                  fontFamily: 'Outfit',
                  fontWeight: 900,
                  color: '#66bb6a'
                }}
              >
                €{guadagno.toFixed(2)}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
