"use client";

import Box from '@mui/material/Box';
import { useState, useCallback, useEffect, useMemo } from 'react';

import PageContainer from '@/common/components/layout/PageContainer';
import PageHeader from '@/common/components/common/PageHeader';
import DataTable, { TableFooterTotal, createDateColumn, createPriceColumn, type ColumnDefinition } from '@/common/components/table/DataTable';
import Icon from '@/common/components/ui/Icon';
import { useModalState } from '@/common/hooks/useModalState';
import { useSmartFiltersState } from '@/common/hooks/useSmartFiltersState';
import EntrataModal from '../components/modals/EntrataModal';
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
  const modal = useModalState();
  const filters = useSmartFiltersState({
    searchPlaceholder: 'Cerca entrata...',
    enableMonthPicker: true,
  });
  const { monthStr, monthLabel, debouncedSearch, smartFiltersProps } = filters;

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

  const allMonthEntrate = allEntrate.filter((e) => e.createdAt.startsWith(monthStr));
  const entrate = useMemo(() => {
    if (!debouncedSearch) return allMonthEntrate;
    const q = debouncedSearch.toLowerCase();
    return allMonthEntrate.filter((e) => e.name.toLowerCase().includes(q));
  }, [allMonthEntrate, debouncedSearch]);
  const total = entrate.reduce((acc, e) => acc + e.amount, 0);

  const handleDelete = async (entrata: EntrataLibera) => {
    await entrataLiberaApi.delete(entrata.id);
    await fetchEntrate();
  };

  return (
    <PageContainer>
      <PageHeader
        title="Entrate Libere"
        smartFilters={smartFiltersProps}
        showButton
        buttonLabel="Aggiungi"
        buttonIcon={<Icon name="plus" size={16} />}
        buttonRequiresAdmin
        onButtonClick={modal.openCreate}
      />

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DataTable<EntrataLibera>
          columns={columns}
          data={entrate}
          isLoading={isLoading}
          keyExtractor={(e) => e.id}
          hideToolbar
          emptyTitle={`Nessuna entrata per ${monthLabel}`}
          emptyDescription="Registra la tua prima entrata per questo mese."
          onDelete={handleDelete}
          footerContent={<TableFooterTotal total={total} label={`Totale ${monthLabel}`} color="primary" />}
        />
      </Box>

      <EntrataModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        onSuccess={() => void fetchEntrate()}
      />
    </PageContainer>
  );
}
