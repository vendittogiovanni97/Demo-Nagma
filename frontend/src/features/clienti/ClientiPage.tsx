"use client";

import StatePanel from '@/components/feedback/StatePanel';
import PageHeader from '@/components/layout/PageHeader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ExportModal from '@/components/modals/ExportModal';
import { EXPORT_FETCH_LIMIT } from '@/config/env';
import { useAuth } from '@/context/AuthContext';
import { useCustomers } from '@/hooks/domain/useCustomers';
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm';
import { customerService } from '@/services/customer.service';
import type { Customer } from '@/types/customer';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Box } from '@mui/material';
import CustomerFilters from './components/CustomerFilters';
import CustomerDataTable from './components/CustomerDataTable';
import CustomerModal from './components/CustomerModal';
import { useCustomerColumns, useCustomerExportColumns } from './hooks/useCustomerColumns';
import { useCustomersFilter } from './hooks/useCustomersFilter';

export default function ClientiPage() {
  const { isAdmin } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const { deleteItem, confirmDialogProps } = useDeleteConfirm();

  const {
    search,
    startDate,
    endDate,
    page,
    debouncedSearch,
    exportFilters,
    setSearch,
    setStartDate,
    setEndDate,
    setPage,
    resetDates,
  } = useCustomersFilter();

  const { data: result, mutate, isLoading, error } = useCustomers({
    search: debouncedSearch,
    page,
    startDate,
    endDate,
  });

  const customers = result?.data ?? [];
  const totalPages = result?.totalPages ?? 1;

  const customerColumns = useCustomerColumns();
  const exportColumns = useCustomerExportColumns();

  const handleDelete = async (id: number) => {
    await deleteItem({
      confirmMessage: 'Sei sicuro di voler eliminare questo cliente?',
      action: () => customerService.delete(id),
      successMessage: 'Cliente eliminato',
      errorMessage: "Errore durante l'eliminazione",
      onSuccess: mutate,
    });
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <PageHeader
        title="Anagrafica Clienti"
        customFilters={
          <CustomerFilters
            search={search}
            startDate={startDate}
            endDate={endDate}
            onSearchChange={setSearch}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onResetDates={resetDates}
          />
        }
        extraActions={
          <ExportModal
            filenameBase="clienti"
            title="Anagrafica Clienti"
            rows={customers}
            columns={exportColumns}
            filters={exportFilters}
            filtersLabel={`Ricerca: ${debouncedSearch || 'nessuna'}`}
            resolveRows={async () => {
              const response = await customerService.getAll(debouncedSearch, 1, EXPORT_FETCH_LIMIT);
              return response.data;
            }}
          />
        }
        showButton
        buttonLabel="Nuovo Cliente"
        buttonIcon={<UserPlus />}
        buttonRequiresAdmin
        onButtonClick={() => {
          setEditingCustomer(null);
          setIsModalOpen(true);
        }}
      />

      {error && (
        <StatePanel
          variant="error"
          fullPage
          title="Impossibile caricare i clienti"
          description="Riprova tra qualche secondo o aggiorna la pagina."
        />
      )}

      {!error && (
        <CustomerDataTable
          customers={customers}
          columns={customerColumns}
          isLoading={isLoading}
          debouncedSearch={debouncedSearch}
          page={page}
          totalPages={totalPages}
          total={result?.total ?? 0}
          onPrevPage={() => setPage((p) => Math.max(1, p - 1))}
          onNextPage={() => setPage((p) => Math.min(totalPages, p + 1))}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => mutate()}
        customer={editingCustomer}
      />
      <ConfirmDialog {...confirmDialogProps} />
    </Box>
  );
}
