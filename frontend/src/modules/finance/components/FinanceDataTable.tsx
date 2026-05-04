"use client";

import SmartTable from '@/components/common/SmartTable';
import { Column } from '@/components/data-display/DataTable';
import { formatPrice } from '@/shared/utils/format';
import {
  Box,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';

import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Clock, Edit2, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { Transaction } from '../api/finance.api';

interface FinanceDataTableProps {
  data: Transaction[];
  isLoading: boolean;
  onEdit: (t: Transaction) => void;
  onDelete: (id: number) => void;
}

export default function FinanceDataTable({ data, isLoading, onEdit, onDelete }: FinanceDataTableProps) {
  const theme = useTheme();

  const columns: Column<Transaction>[] = [
    {
      key: 'date',
      label: 'Data',
      width: '150px',
      render: (t) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {format(new Date(t.date), 'dd MMM yyyy', { locale: it })}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Clock size={10} /> {format(new Date(t.date), 'HH:mm')}
          </Typography>
        </Box>
      )
    },
    {
      key: 'type',
      label: 'Tipo',
      width: '120px',
      render: (t) => (
        <Chip
          label={t.type === 'INCOME' ? 'Entrata' : 'Uscita'}
          size="small"
          icon={t.type === 'INCOME' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          sx={{
            fontWeight: 700,
            bgcolor: t.type === 'INCOME' ? `${theme.palette.success.main}15` : `${theme.palette.error.main}15`,
            color: t.type === 'INCOME' ? theme.palette.success.main : theme.palette.error.main,
            border: `1px solid ${t.type === 'INCOME' ? theme.palette.success.main : theme.palette.error.main}30`
          }}
        />
      )
    },
    {
      key: 'category',
      label: 'Categoria',
      width: '150px',
    },
    {
      key: 'description',
      label: 'Descrizione',
    },
    {
      key: 'sourceType',
      label: 'Fonte',
      width: '120px',
      render: (t) => {
        if (!t.sourceType) return <Typography variant="caption" color="text.secondary">—</Typography>;
        const labels: Record<string, string> = {
          'SPESA_LIBERA': 'Spesa Libera',
          'BOOKING': 'Tatuaggio',
          'BOOKING_COMMISSION': 'Commissione',
          'ARTIST_PAYMENT': 'Pagamento'
        };
        return (
          <Typography variant="caption" sx={{ 
            fontWeight: 700, 
            textTransform: 'uppercase',
            color: 'text.secondary',
            bgcolor: 'rgba(255,255,255,0.03)',
            px: 1, py: 0.5, borderRadius: 1
          }}>
            {labels[t.sourceType] || t.sourceType}
          </Typography>
        );
      }
    },
    {
      key: 'amount',
      label: 'Importo',
      align: 'right',
      width: '120px',
      render: (t) => (
        <Typography variant="body1" sx={{
          fontWeight: 800,
          color: t.type === 'INCOME' ? theme.palette.success.main : theme.palette.error.main
        }}>
          {t.type === 'INCOME' ? '+' : '-'}{formatPrice(t.amount)}
        </Typography>
      )
    }
  ];

  const actions = (t: Transaction) => (
    <Stack sx={{ flexDirection: 'row', gap: 1 }} component="div">
      <Tooltip title="Modifica">
        <IconButton size="small" onClick={() => onEdit(t)} sx={{ color: theme.palette.primary.main }}>
          <Edit2 size={16} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Elimina">
        <IconButton size="small" onClick={() => onDelete(t.id)} sx={{ color: theme.palette.error.main }}>
          <Trash2 size={16} />
        </IconButton>
      </Tooltip>
    </Stack>
  );

  return (
    <SmartTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      keyExtractor={(t) => t.id}
      actions={actions}
      emptyTitle="Nessuna transazione trovata"
      emptyDescription="Prova a cambiare i filtri o aggiungi una nuova transazione."
    />
  );
}
