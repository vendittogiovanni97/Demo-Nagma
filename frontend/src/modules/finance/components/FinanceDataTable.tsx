"use client";

import DataTable, { ColumnDefinition as Column } from '@/common/components/table/DataTable';
import { formatPrice } from '@/common/shared/utils/format';
import {
  Box,
  Stack,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import Badge from '@/common/components/ui/Badge';
import Button from '@/common/components/ui/Button';

import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import Icon, { TrendingDown, TrendingUp } from '@/common/components/ui/Icon';
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
            <Icon name="clock" size={10} /> {format(new Date(t.date), 'HH:mm')}
          </Typography>
        </Box>
      )
    },
    {
      key: 'type',
      label: 'Tipo',
      width: '120px',
      render: (t) => (
        <Badge
          label={t.type === 'INCOME' ? 'Entrata' : 'Uscita'}
          size="sm"
          icon={t.type === 'INCOME' ? TrendingUp : TrendingDown}
          variant={t.type === 'INCOME' ? 'success' : 'error'}
          sx={{
            fontWeight: 700,
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
        <Button variant="icon" icon={<Icon name="edit2" size={16} />} onClick={() => onEdit(t)} sx={{ color: theme.palette.primary.main }} />
      </Tooltip>
      <Tooltip title="Elimina">
        <Button variant="icon" icon={<Icon name="trash2" size={16} />} onClick={() => onDelete(t.id)} sx={{ color: theme.palette.error.main }} />
      </Tooltip>
    </Stack>
  );

  return (
    <DataTable
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
