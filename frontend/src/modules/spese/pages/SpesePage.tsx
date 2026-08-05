"use client";

import Box from '@mui/material/Box';
import { useState } from 'react';

import PageContainer from '@/common/components/layout/PageContainer';
import PageHeader from '@/common/components/common/PageHeader';
import MonthPicker from '@/common/components/ui/MonthPicker';
import DataTable, { TableFooterTotal, createDateColumn, createPriceColumn, type ColumnDefinition } from '@/common/components/table/DataTable';
import SmartModal from '@/common/components/common/SmartModal';
import FormInput from '@/common/components/forms/FormInput';
import Button from '@/common/components/ui/Button';
import Icon from '@/common/components/ui/Icon';
import PermissionGate from '@/common/components/auth/PermissionGate';
import { useMonthNavigation } from '@/common/hooks/useMonthNavigation';
import { useToast } from '@/common/hooks/useToast';
import { extractErrorMessage } from '@/common/shared/utils/extract-error';
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
  const toast = useToast();

  const { data: allSpese, isLoading, mutate } = useSpeseLibere(monthStr);

  const spese = allSpese?.filter((s) => s.createdAt.startsWith(monthStr)) ?? [];
  const total = spese.reduce((acc, s) => acc + s.price, 0);

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
      toast.error('Inserisci il nome della spesa');
      return;
    }
    const parsed = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) {
      toast.error('Inserisci un importo valido');
      return;
    }
    setIsSaving(true);
    try {
      await spesaLiberaApi.create({ name: name.trim(), price: parsed });
      await mutate();
      toast.success('Spesa aggiunta');
      handleCloseModal();
    } catch (e) {
      toast.error(extractErrorMessage(e, 'Errore nel salvataggio'));
    } finally {
      setIsSaving(false);
    }
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
              <Button
                variant="secondary"
                onClick={handleOpenModal}
                sx={{ height: '42px', px: 3, borderRadius: 2, fontWeight: 600 }}
              >
                <Icon name="plus" size={16} />
                Aggiungi
              </Button>
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

      {/* Modale Aggiungi Spesa */}
      <SmartModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title="Nuova Spesa"
        maxWidth="xs"
        onSave={handleSave}
        isSaving={isSaving}
        saveLabel="Aggiungi Spesa"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <FormInput
            label="Nome spesa"
            value={name}
            onChange={setName}
            placeholder="es. Caffè, Affitto, Materiale..."
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
