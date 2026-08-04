"use client";

import Box from '@mui/material/Box';
import { Typography, useTheme } from '@mui/material';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import React from 'react';

import PageContainer from '@/common/components/layout/PageContainer';
import PageHeader from '@/common/components/common/PageHeader';
import MonthPicker from '@/common/components/ui/MonthPicker';
import DataTable, { TableFooterTotal, createDateColumn, createPriceColumn, type ColumnDefinition } from '@/common/components/table/DataTable';
import InlineAddForm from '@/common/components/forms/InlineAddForm';
import PermissionGate from '@/common/components/auth/PermissionGate';
import { useMonthNavigation } from '@/common/hooks/useMonthNavigation';
import { spesaLiberaApi } from '../api/spesa-libera.api';
import { useSpeseLibere } from '../hooks/useTransactions';
import type { SpesaLibera } from '../model/spese.types';

// ─── Colonne tabella ──────────────────────────────────────────────────────────

const columns: ColumnDefinition<SpesaLibera>[] = [
  { key: 'name', label: 'Nome', flex: 2, minWidth: 260 },
  createDateColumn<SpesaLibera>('createdAt', 'Data'),
  createPriceColumn<SpesaLibera>('price', 'Prezzo', 'primary'),
];

// ─── Pagina ───────────────────────────────────────────────────────────────────

export default function SpesePage() {
  const { currentMonth: currentDate, setCurrentMonth: setCurrentDate, monthStr, monthLabel } = useMonthNavigation();

  const { data: allSpese, isLoading, mutate } = useSpeseLibere(monthStr);

  const spese = allSpese?.filter((s) => s.createdAt.startsWith(monthStr)) ?? [];
  const total = spese.reduce((acc, s) => acc + s.price, 0);

  const handleAdd = async (data: { name: string; amount: number }) => {
    await spesaLiberaApi.create({ name: data.name, price: data.amount });
    await mutate();
  };

  const handleDelete = async (spesa: SpesaLibera) => {
    await spesaLiberaApi.delete(spesa.id);
    await mutate();
  };

  return (
    <PageContainer>
      <PageHeader
        title="Spese Libere"
        expandFilters
        filters={(
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 1.5,
              width: '100%',
            }}
          >
            <MonthPicker value={currentDate} onChange={setCurrentDate} />
            <PermissionGate requireAdmin>
              <Box
                sx={{
                  flex: { xs: '1 1 100%', md: '0 1 1150px', xl: '0 1 1250px' },
                  width: '100%',
                  minWidth: 0,
                }}
              >
                <InlineAddForm
                  namePlaceholder="Nome spesa (es. Caffè, Affitto...)"
                  onAdd={handleAdd}
                  successMessage="Spesa aggiunta"
                />
              </Box>
            </PermissionGate>
          </Box>
        )}
      />

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DataTable<SpesaLibera>
          columns={columns}
          data={spese}
          isLoading={isLoading}
          keyExtractor={(s) => s.id}
          emptyTitle={`Nessuna spesa per ${monthLabel}`}
          emptyDescription="Registra la tua prima spesa per questo mese."
          onDelete={handleDelete}
          deleteConfirmTitle="Elimina spesa"
          deleteConfirmMessage="Sei sicuro di voler eliminare questa spesa libera?"
          footerContent={<TableFooterTotal total={total} label={`Totale ${monthLabel}`} color="primary" />}
        />
      </Box>
    </PageContainer>
  );
}
