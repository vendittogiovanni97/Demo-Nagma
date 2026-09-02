"use client";

import Box from '@mui/material/Box';
import { useMemo } from 'react';

import PageContainer from '@/common/components/layout/PageContainer';
import PageHeader from '@/common/components/common/PageHeader';
import DataTable, { TableFooterTotal, createDateColumn, createPriceColumn, type ColumnDefinition } from '@/common/components/table/DataTable';
import Icon from '@/common/components/ui/Icon';
import { useModalState } from '@/common/hooks/useModalState';
import { useSmartFiltersState } from '@/common/hooks/useSmartFiltersState';
import { useLiberaMovimenti } from '@/common/hooks/useLiberaMovimenti';
import { normalizeSearch } from '@/common/shared/utils/normalizeSearch';
import LiberaMovimentoModal from '@/common/components/modals/LiberaMovimentoModal';
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

  const { data: allEntrate, isLoading, mutate } = useLiberaMovimenti<EntrataLibera>(
    '/api/finance/entrate-libere',
    entrataLiberaApi.getAll,
    monthStr,
  );

  const allMonthEntrate = (allEntrate ?? []).filter((e) => e.createdAt.startsWith(monthStr));
  const entrate = useMemo(() => {
    if (!debouncedSearch) return allMonthEntrate;
    const q = normalizeSearch(debouncedSearch);
    return allMonthEntrate.filter((e) => normalizeSearch(e.name).includes(q));
  }, [allMonthEntrate, debouncedSearch]);
  const total = entrate.reduce((acc, e) => acc + e.amount, 0);

  const handleDelete = async (entrata: EntrataLibera) => {
    await entrataLiberaApi.delete(entrata.id);
    await mutate();
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

      <LiberaMovimentoModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        onSuccess={() => void mutate()}
        title="Nuova Entrata"
        saveLabel="Aggiungi Entrata"
        nameLabel="Nome entrata"
        namePlaceholder="es. Rimborso, Extra..."
        invalidNameMessage="Inserisci il nome dell'entrata"
        successMessage="Entrata aggiunta"
        errorMessage="Errore nel salvataggio dell'entrata"
        onCreate={({ name, amount }) => entrataLiberaApi.create({ name, amount })}
      />
    </PageContainer>
  );
}
