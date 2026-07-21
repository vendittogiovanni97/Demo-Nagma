'use client';

import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ReportDetailItem } from '../api/reportsApi';

interface ReportsDataGridProps {
  data: ReportDetailItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (newPage: number) => void;
}

export function ReportsDataGrid({
  data,
  total,
  page,
  limit,
  totalPages,
  isLoading,
  onPageChange,
}: ReportsDataGridProps) {
  const theme = useTheme();

  const columnDefs: ColDef<ReportDetailItem>[] = useMemo(
    () => [
      { field: 'id', headerName: 'ID', width: 120, sortable: true },
      { field: 'date', headerName: 'Data', width: 130, sortable: true },
      {
        field: 'type',
        headerName: 'Tipo',
        width: 140,
        cellRenderer: (params: any) => {
          const isIncome = params.value === 'INCOME';
          return (
            <Chip
              label={isIncome ? 'ENTRATA' : 'USCITA'}
              color={isIncome ? 'success' : 'error'}
              size="small"
              variant="outlined"
            />
          );
        },
      },
      { field: 'category', headerName: 'Categoria', width: 180, sortable: true, filter: true },
      { field: 'description', headerName: 'Descrizione', flex: 1, minWidth: 200, filter: true },
      {
        field: 'amount',
        headerName: 'Importo (€)',
        width: 150,
        sortable: true,
        cellRenderer: (params: any) => {
          const val = Number(params.value || 0);
          return (
            <Typography
              variant="body2"
              sx={{
                fontWeight: 'bold',
                color: params.data?.type === 'INCOME' ? 'success.main' : 'error.main',
              }}
            >
              € {val.toFixed(2)}
            </Typography>
          );
        },
      },
    ],
    []
  );

  const defaultColDef: ColDef = useMemo(
    () => ({
      resizable: true,
      suppressMovable: true,
    }),
    []
  );

  return (
    <Card sx={{ boxShadow: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Movimenti & Dettaglio Report
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Totale voci: {total}
          </Typography>
        </Box>

        <Box
          className="ag-theme-alpine"
          sx={{
            height: 450,
            width: '100%',
            '& .ag-header': {
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          <AgGridReact
            rowData={data}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            animateRows={true}
            loading={isLoading}
            overlayLoadingTemplate='<span class="ag-overlay-loading-center">Caricamento dati report...</span>'
            overlayNoRowsTemplate='<span class="ag-overlay-loading-center">Nessun dato trovato per i filtri selezionati</span>'
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Pagina {page} di {totalPages} (Mostrati {data.length} su {total})
          </Typography>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => onPageChange(newPage)}
            color="primary"
            shape="rounded"
          />
        </Box>
      </CardContent>
    </Card>
  );
}
