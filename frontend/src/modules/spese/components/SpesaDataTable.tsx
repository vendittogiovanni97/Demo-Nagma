"use client";

import SmartTable from '@/components/common/SmartTable';
import type { SpesaLibera } from '../model/spese.types';
import { formatPrice } from '@/shared/utils/format';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';
import { Box, Typography, useTheme } from '@mui/material';
import Button from '@/components/ui/Button';

interface SpesaDataTableProps {
  spese: SpesaLibera[];
  isLoading: boolean;
  monthLabel: string;
  total: number;
  onDelete: (id: number) => void;
}

export default function SpesaDataTable({
  spese,
  isLoading,
  monthLabel,
  total,
  onDelete,
}: SpesaDataTableProps) {
  const theme = useTheme();

  const columns = [
    { key: 'name', label: 'Nome', flex: 1 },
    { 
      key: 'createdAt', 
      label: 'Data', 
      width: '150px',
      render: (s: SpesaLibera) => format(new Date(s.createdAt), 'd MMMM yyyy', { locale: it }) 
    },
    { 
      key: 'price', 
      label: 'Prezzo', 
      align: 'right' as const,
      width: '120px',
      render: (s: SpesaLibera) => (
        <Typography sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
          {formatPrice(s.price)}
        </Typography>
      )
    },
  ];

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <SmartTable<SpesaLibera>
        columns={columns}
        data={spese}
        isLoading={isLoading}
        keyExtractor={(s) => s.id}
        emptyTitle={`Nessuna spesa per ${monthLabel}`}
        emptyDescription="Registra la tua prima spesa per questo mese."
        actions={(spesa) => (
          <Button
            variant="icon"
            size="sm"
            onClick={() => onDelete(spesa.id)}
            icon={<Trash2 size={16} />}
            title="Elimina"
            sx={{
              color: 'rgba(244,67,54,0.6)',
              '&:hover': {
                color: theme.palette.error.main,
                backgroundColor: 'rgba(244,67,54,0.1)',
              },
            }}
          />
        )}
        pageSize={15}
      />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          py: 2,
          border: 1,
          borderTop: 0,
          borderColor: 'divider',
          borderRadius: '0 0 12px 12px',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: theme.palette.text.secondary,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          Totale {monthLabel}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: theme.palette.primary.main,
            fontVariant: 'tabular-nums',
          }}
        >
          {formatPrice(total)}
        </Typography>
      </Box>
    </Box>
  );
}
