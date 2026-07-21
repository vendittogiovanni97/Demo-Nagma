'use client';

import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import DataTable, { ColumnDefinition } from '@/common/components/table/DataTable';
import { MonoText } from '@/common/components/ui/MonoText';
import { formatDate, formatPrice } from '@/common/shared/utils/format';
import { ReportDetailItem } from '../api/reportsApi';

interface ReportsDataGridProps {
  data: ReportDetailItem[];
  total: number;
  limit: number;
  isLoading: boolean;
}

export function ReportsDataGrid({
  data,
  total,
  limit,
  isLoading,
}: ReportsDataGridProps) {
  const columns: ColumnDefinition<ReportDetailItem>[] = useMemo(
    () => [
      {
        key: 'id',
        label: 'ID',
        width: 90,
        sortable: true,
        render: (row) => <MonoText>#{row.id}</MonoText>,
      },
      {
        key: 'date',
        label: 'Data',
        minWidth: 140,
        sortable: true,
        render: (row) => <MonoText>{formatDate(row.date, 'dd/MM/yyyy HH:mm')}</MonoText>,
      },
      {
        key: 'type',
        label: 'Tipo',
        minWidth: 130,
        align: 'center',
        render: (row) => {
          const isIncome = row.type === 'INCOME';
          return (
            <Chip
              label={isIncome ? 'ENTRATA' : 'USCITA'}
              color={isIncome ? 'success' : 'error'}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 700 }}
            />
          );
        },
      },
      {
        key: 'category',
        label: 'Categoria',
        minWidth: 160,
        sortable: true,
      },
      {
        key: 'description',
        label: 'Descrizione',
        minWidth: 320,
        flex: 2,
        render: (row) => (
          <Typography
            variant="body2"
            title={row.description}
            sx={{
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              width: '100%',
            }}
          >
            {row.description}
          </Typography>
        ),
      },
      {
        key: 'amount',
        label: 'Importo',
        minWidth: 140,
        align: 'right',
        sortable: true,
        render: (row) => {
          const val = Number(row.amount || 0);
          return (
            <Typography
              variant="body2"
              sx={{
                fontWeight: 'bold',
                color: row.type === 'INCOME' ? 'success.main' : 'error.main',
              }}
            >
              {formatPrice(val)}
            </Typography>
          );
        },
      },
    ],
    []
  );

  return (
    <Box sx={{ mt: 3 }}>
      <DataTable
        title="Movimenti & Dettaglio Report"
        subtitle={`Totale movimenti: ${total}`}
        data={data}
        columns={columns}
        isLoading={isLoading}
        exportable
        hideState={true}
        exportFileName="report_movimenti"
        emptyTitle="Nessun movimento trovato"
        emptyDescription="Nessun dato registrato per i filtri ed il periodo selezionato"
        pageSize={limit}
      />
    </Box>
  );
}
