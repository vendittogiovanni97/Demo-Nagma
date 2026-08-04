"use client";

import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';

import PageContainer from '@/common/components/layout/PageContainer';
import PageHeader from '@/common/components/common/PageHeader';
import DataTable, { TableFooterTotal, createDateColumn, createPriceColumn, type ColumnDefinition, type FetchParams } from '@/common/components/table/DataTable';
import { useSmartFiltersState } from '@/common/hooks/useSmartFiltersState';
import { accontiApi } from '../api/acconti.api';
import type { Acconto } from '../model/acconti.types';

const columns: ColumnDefinition<Acconto>[] = [
  {
    key: 'description',
    label: 'Descrizione',
    flex: 2,
    minWidth: 260,
  },
  createDateColumn<Acconto>('date', 'Data'),
  createPriceColumn<Acconto>('amount', 'Importo', 'success'),
];

export default function AccontiPage() {
  const filters = useSmartFiltersState({
    enableMonthPicker: true,
    enableDateRange: true,
    searchPlaceholder: 'Cerca per descrizione...',
  });

  const { monthStr, monthLabel, startDate, endDate, debouncedSearch, smartFiltersProps } = filters;
  const [total, setTotal] = useState(0);

  const fetchAcconti = useCallback(
    async (params: FetchParams) => {
      const hasDateRange = startDate || endDate;
      const res = await accontiApi.getAll({
        month: hasDateRange ? undefined : monthStr,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        search: debouncedSearch || undefined,
        page: params.page + 1,
        limit: params.limit,
      });
      setTotal(res.data.reduce((acc, a) => acc + a.amount, 0));
      return { data: res.data, total: res.total };
    },
    [monthStr, startDate, endDate, debouncedSearch]
  );

  const hasDateRange = startDate || endDate;
  const totalLabel = hasDateRange ? 'Totale periodo' : `Totale ${monthLabel}`;
  const emptyLabel = hasDateRange
    ? 'Nessun acconto trovato per il periodo selezionato.'
    : `Nessun acconto registrato per ${monthLabel}.`;
  const refreshKey = `${monthStr}-${startDate}-${endDate}-${debouncedSearch}`;

  return (
    <PageContainer gap={3}>
      <PageHeader
        title="Acconti"
        smartFilters={smartFiltersProps}
      />

      <Box sx={{ flex: 1 }}>
        <DataTable<Acconto>
          columns={columns}
          fetchData={fetchAcconti}
          refreshKey={refreshKey}
          keyExtractor={(a) => a.id}
          emptyTitle="Nessun acconto trovato"
          emptyDescription={emptyLabel}
          hideToolbar
          footerContent={<TableFooterTotal total={total} label={totalLabel} color="success" />}
        />
      </Box>
    </PageContainer>
  );
}
