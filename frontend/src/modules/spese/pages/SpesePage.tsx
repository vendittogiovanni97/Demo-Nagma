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
import { spesaLiberaApi } from '../api/spesa-libera.api';
import type { SpesaLibera } from '../model/spese.types';

// ─── Colonne tabella ──────────────────────────────────────────────────────────

const columns: ColumnDefinition<SpesaLibera>[] = [
  { key: 'name', label: 'Nome', flex: 2, minWidth: 260 },
  createDateColumn<SpesaLibera>('createdAt', 'Data'),
  createPriceColumn<SpesaLibera>('price', 'Prezzo', 'primary'),
];

// ─── Pagina ───────────────────────────────────────────────────────────────────

export default function SpesePage() {
  const modal = useModalState();
  const filters = useSmartFiltersState({
    searchPlaceholder: 'Cerca spesa...',
    enableMonthPicker: true,
  });
  const { monthStr, monthLabel, debouncedSearch, smartFiltersProps } = filters;

  const { data: allSpese, isLoading, mutate } = useLiberaMovimenti<SpesaLibera>(
    '/api/finance/spese-libere',
    spesaLiberaApi.getAll,
    monthStr,
  );

  const allMonthSpese = allSpese?.filter((s) => s.createdAt.startsWith(monthStr)) ?? [];
  const spese = useMemo(() => {
    if (!debouncedSearch) return allMonthSpese;
    const q = normalizeSearch(debouncedSearch);
    return allMonthSpese.filter((s) => normalizeSearch(s.name).includes(q));
  }, [allMonthSpese, debouncedSearch]);
  const total = spese.reduce((acc, s) => acc + s.price, 0);

  const handleDelete = async (spesa: SpesaLibera) => {
    await spesaLiberaApi.delete(spesa.id);
    await mutate();
  };

  return (
    <PageContainer>
      <PageHeader
        title="Spese Libere"
        smartFilters={smartFiltersProps}
        showButton
        buttonLabel="Aggiungi"
        buttonIcon={<Icon name="plus" size={16} />}
        buttonRequiresAdmin
        onButtonClick={modal.openCreate}
      />

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DataTable<SpesaLibera>
          columns={columns}
          data={spese}
          isLoading={isLoading}
          keyExtractor={(s) => s.id}
          hideToolbar
          emptyTitle={`Nessuna spesa per ${monthLabel}`}
          emptyDescription="Registra la tua prima spesa per questo mese."
          onDelete={handleDelete}
          footerContent={<TableFooterTotal total={total} label={`Totale ${monthLabel}`} color="primary" />}
        />
      </Box>

      <LiberaMovimentoModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        onSuccess={() => void mutate()}
        title="Nuova Spesa"
        saveLabel="Aggiungi Spesa"
        nameLabel="Nome spesa"
        namePlaceholder="es. Caffè, Affitto, Materiale..."
        invalidNameMessage="Inserisci il nome della spesa"
        successMessage="Spesa aggiunta"
        errorMessage="Errore nel salvataggio della spesa"
        onCreate={({ name, amount }) => spesaLiberaApi.create({ name, price: amount })}
      />
    </PageContainer>
  );
}
