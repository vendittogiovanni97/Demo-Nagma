"use client";

import Box from '@mui/material/Box';
import { useState, useCallback, useEffect, useMemo } from 'react';

import PageContainer from '@/common/components/layout/PageContainer';
import PageHeader from '@/common/components/common/PageHeader';
import DataTable, { TableFooterTotal, createDateColumn, createPriceColumn, type ColumnDefinition } from '@/common/components/table/DataTable';
import SmartModal from '@/common/components/common/SmartModal';
import FormInput from '@/common/components/forms/FormInput';
import Icon from '@/common/components/ui/Icon';
import { useSmartFiltersState } from '@/common/hooks/useSmartFiltersState';
import { useToast } from '@/common/hooks/useToast';
import { extractErrorMessage } from '@/common/shared/utils/extract-error';
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
  const filters = useSmartFiltersState({
    searchPlaceholder: 'Cerca entrata...',
    enableMonthPicker: true,
  });
  const { monthStr, monthLabel, debouncedSearch, smartFiltersProps } = filters;
  const toast = useToast();

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

  // ─── Modale Aggiungi ────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setName('');
    setAmount('');
  };

  const handleOpenModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    resetForm();
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Inserisci il nome dell\'entrata');
      return;
    }
    const parsed = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) {
      toast.error('Inserisci un importo valido');
      return;
    }
    setIsSaving(true);
    try {
      await entrataLiberaApi.create({ name: name.trim(), amount: parsed });
      await fetchEntrate();
      toast.success('Entrata aggiunta');
      handleCloseModal();
    } catch (e) {
      toast.error(extractErrorMessage(e, 'Errore nel salvataggio'));
    } finally {
      setIsSaving(false);
    }
  };

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
        onButtonClick={handleOpenModal}
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
          deleteConfirmTitle="Elimina entrata"
          deleteConfirmMessage="Sei sicuro di voler eliminare questa entrata libera?"
          footerContent={<TableFooterTotal total={total} label={`Totale ${monthLabel}`} color="primary" />}
        />
      </Box>

      {/* Modale Aggiungi Entrata */}
      <SmartModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title="Nuova Entrata"
        maxWidth="xs"
        onSave={handleSave}
        isSaving={isSaving}
        saveLabel="Aggiungi Entrata"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <FormInput
            label="Nome entrata"
            value={name}
            onChange={setName}
            placeholder="es. Rimborso, Extra, Vendita..."
            required
          />
          <FormInput
            label="Importo (€)"
            value={amount}
            onChange={(val) => {
              const cleaned = val.replace(/\./g, ',');
              if (cleaned === '' || /^\d*(,\d{0,2})?$/.test(cleaned)) {
                setAmount(cleaned);
              }
            }}
            placeholder="0,00"
            required
          />
        </Box>
      </SmartModal>
    </PageContainer>
  );
}
