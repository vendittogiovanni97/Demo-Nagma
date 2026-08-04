"use client";

import FormInput from '@/common/components/forms/FormInput';
import FormSelect from '@/common/components/forms/FormSelect';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

interface FinancialSummaryRowProps {
  price: number | string;
  deposit: number | string;
  percentualeMode: number | string;
  prezzoArtista: number;
  guadagno: number;
  percentualeOptions: Array<{ label: string; value: number | string }>;
  onChangeField: (field: any, value: any) => void;
}

export function FinancialSummaryRow({
  price,
  deposit,
  percentualeMode,
  prezzoArtista,
  guadagno,
  percentualeOptions,
  onChangeField,
}: FinancialSummaryRowProps) {
  const theme = useTheme();

  return (
    <Grid size={12}>
      <Grid container spacing={2} sx={{ alignItems: 'flex-end' }}>
        <Grid size={{ xs: 4, sm: 2 }}>
          <FormInput
            label="Prezzo"
            type="number"
            value={price}
            onChange={(v) => onChangeField('price', v)}
            size="sm"
            placeholder="€"
          />
        </Grid>
        <Grid size={{ xs: 4, sm: 2 }}>
          <FormInput
            label="Acconto"
            type="number"
            value={deposit}
            onChange={(v) => onChangeField('deposit', v)}
            size="sm"
            placeholder="€"
          />
        </Grid>
        <Grid size={{ xs: 4, sm: 2 }}>
          <FormSelect
            label="% Artista"
            value={percentualeMode}
            onChange={(v) => onChangeField('percentualeMode', v)}
            options={percentualeOptions}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.06),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase' }}>
              Artista
            </Typography>
            <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: theme.palette.primary.main }}>
              €{prezzoArtista.toFixed(2)}
            </Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.success.main, 0.06),
              border: `1px solid ${alpha(theme.palette.success.main, 0.15)}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase' }}>
              Studio
            </Typography>
            <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: theme.palette.success.main }}>
              €{guadagno.toFixed(2)}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Grid>
  );
}
