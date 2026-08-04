"use client";

import DataTable, { ColumnDefinition as Column } from '@/common/components/table/DataTable';
import { formatPrice } from '@/common/shared/utils/format';
import {
  Box,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import Badge from '@/common/components/ui/Badge';

import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import Icon, { TrendingDown, TrendingUp } from '@/common/components/ui/Icon';
import { Transaction } from '../api/finance.api';

interface FinanceDataTableProps {
  data: Transaction[];
  isLoading: boolean;
}

export default function FinanceDataTable({ data, isLoading }: FinanceDataTableProps) {
  const theme = useTheme();

  const columns: Column<Transaction>[] = [
    {
      key: 'id',
      label: 'ID',
      minWidth: 70,
      flex: 0.45,
      align: 'center',
    },
    {
      key: 'date',
      label: 'Data',
      minWidth: 135,
      flex: 1,
      align: 'center',
      render: (t) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {format(new Date(t.date), 'dd MMM yyyy', { locale: it })}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}
          >
            <Icon name="clock" size={10} /> {format(new Date(t.date), 'HH:mm')}
          </Typography>
        </Box>
      )
    },
    {
      key: 'type',
      label: 'Tipo',
      minWidth: 115,
      flex: 0.85,
      align: 'center',
      render: (t) => (
        <Badge
          label={t.type === 'ENTRATA' ? 'Entrata' : 'Uscita'}
          size="sm"
          icon={t.type === 'ENTRATA' ? TrendingUp : TrendingDown}
          variant={t.type === 'ENTRATA' ? 'success' : 'error'}
          sx={{
            fontWeight: 700,
          }}
        />
      )
    },
    {
      key: 'category',
      label: 'Categoria',
      minWidth: 130,
      flex: 1,
      align: 'center',
    },
    {
      key: 'description',
      label: 'Descrizione',
      minWidth: 180,
      flex: 1.6,
      align: 'center',
    },
    {
      key: 'sourceType',
      label: 'Fonte',
      minWidth: 120,
      flex: 0.9,
      align: 'center',
      render: (t) => {
        if (!t.sourceType) return <Typography variant="caption" color="text.secondary">—</Typography>;
        const labels: Record<string, string> = {
          'SPESA_LIBERA': 'Spesa Libera',
          'BOOKING': 'Tatuaggio',
          'BOOKING_DEPOSIT': 'Acconto',
          'BOOKING_COMMISSION': 'Commissione',
          'BOOKING_REFUND': 'Rimborso',
          'ARTIST_PAYMENT': 'Pagamento'
        };
        return (
          <Typography variant="caption" sx={{ 
            fontWeight: 700, 
            textTransform: 'uppercase',
            color: 'text.secondary',
            bgcolor: alpha(theme.palette.common.white, 0.03),
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
      align: 'center',
      minWidth: 115,
      flex: 0.9,
      render: (t) => (
        <Typography variant="body1" sx={{
          fontWeight: 800,
          color: t.type === 'ENTRATA' ? theme.palette.success.main : theme.palette.error.main
        }}>
          {t.type === 'ENTRATA' ? '+' : '-'}{formatPrice(t.amount)}
        </Typography>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      baseColumns={[]}
      data={data}
      isLoading={isLoading}
      keyExtractor={(t) => t.id}
      emptyTitle="Nessuna transazione trovata"
      emptyDescription="Prova a cambiare i filtri impostati."
    />
  );
}
