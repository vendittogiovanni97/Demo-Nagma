"use client";

import Box from '@mui/material/Box';
import { Typography, useTheme } from '@mui/material';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useState, useCallback, useEffect } from 'react';
import React from 'react';

import PageContainer from '@/common/components/layout/PageContainer';
import PageHeader from '@/common/components/common/PageHeader';
import MonthPicker from '@/common/components/ui/MonthPicker';
import DataTable, { TableFooterTotal, createDateColumn, createPriceColumn, type ColumnDefinition } from '@/common/components/table/DataTable';
import InlineAddForm from '@/common/components/forms/InlineAddForm';
import PermissionGate from '@/common/components/auth/PermissionGate';
import { useMonthNavigation } from '@/common/hooks/useMonthNavigation';
import { entrataLiberaApi } from '../api/entrata-libera.api';
import type { EntrataLibera } from '../model/entrate.types';

// ─── Colonne tabella ──────────────────────────────────────────────────────────

const columns: ColumnDefinition<EntrataLibera>[] = [
  { key: 'name', label: 'Nome', flex: 2, minWidth: 260 },
  createDateColumn<EntrataLibera>('createdAt', 'Data'),
  createPriceColumn<EntrataLibera>('amount', 'Importo', 'primary'),
];

// ─── Pagina ───────────────────────────────────────────────────────────────────

export default function EntratePage() {
  const { currentMonth: currentDate, setCurrentMonth: setCurrentDate, monthStr, monthLabel } = useMonthNavigation();

  const [allEntrate, setAllEntrate] = useState<EntrataLibera[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEntrate = useCallback(async () => {
    if (!monthStr) return;
    setIsLoading(true);
    try {
      const res = await entrataLiberaApi.getAll(monthStr);
      setAllEntrate(res);
    } catch {
      setAllEntrate([]);
    } finally {
      setIsLoading(false);
    }
  }, [monthStr]);

  useEffect(() => { fetchEntrate(); }, [fetchEntrate]);

  const entrate = allEntrate.filter((e) => e.createdAt.startsWith(monthStr));
  const total = entrate.reduce((acc, e) => acc + e.amount, 0);

  const handleAdd = async (data: { name: string; amount: number }) => {
    await entrataLiberaApi.create({ name: data.name, amount: data.amount });
    await fetchEntrate();
  };

  const handleDelete = async (entrata: EntrataLibera) => {
    await entrataLiberaApi.delete(entrata.id);
    await fetchEntrate();
  };

  return (
    <PageContainer>
      <PageHeader
        title="Entrate Libere"
        expandFilters
        filters={
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
              <Box sx={{ flex: { xs: '1 1 100%', md: '0 1 1150px', xl: '0 1 1250px' }, width: '100%', minWidth: 0 }}>
                <InlineAddForm
                  namePlaceholder="Nome entrata (es. Rimborso, Extra...)"
                  onAdd={handleAdd}
                  successMessage="Entrata aggiunta"
                />
              </Box>
            </PermissionGate>
          </Box>
        }
      />

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DataTable<EntrataLibera>
          columns={columns}
          data={entrate}
          isLoading={isLoading}
          keyExtractor={(e) => e.id}
          emptyTitle={`Nessuna entrata per ${monthLabel}`}
          emptyDescription="Registra la tua prima entrata per questo mese."
          onDelete={handleDelete}
          deleteConfirmTitle="Elimina entrata"
          deleteConfirmMessage="Sei sicuro di voler eliminare questa entrata libera?"
          footerContent={<TableFooterTotal total={total} label={`Totale ${monthLabel}`} color="primary" />}
        />
      </Box>
    </PageContainer>
  );
}
