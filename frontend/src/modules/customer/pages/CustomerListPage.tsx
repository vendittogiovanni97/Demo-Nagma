"use client";

import PageHeader from '@/common/components/common/PageHeader';
import ConfirmDialog from '@/common/components/ui/ConfirmDialog';
import { useAuth } from '@/common/context/AuthContext';
import { useDeleteConfirm } from '@/common/hooks/useDeleteConfirm';
import { Box } from '@mui/material';
import Icon from '@/common/components/ui/Icon';
import { useState } from 'react';
import { customerApi } from '../api/customer.api';
import CustomerDataTable from '../components/CustomerDataTable';
import CustomerFilters from '../components/CustomerFilters';
import CustomerModal from '../components/modals/CustomerModal';
import { useCustomers } from '../hooks/useCustomer';
import { useCustomerColumns } from '../hooks/useCustomerColumns';
import { useCustomersFilter } from '../hooks/useCustomersFilter';
import type { CustomerModel as Customer } from '../model/customer.model';

export default function CustomerListPage() {
  const { isAdmin } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const filterState = useCustomersFilter();
  const columns = useCustomerColumns();
  const { deleteItem, confirmDialogProps } = useDeleteConfirm();

  const { data, isLoading, mutate } = useCustomers({
    search: filterState.debouncedSearch,
    startDate: filterState.startDate,
    endDate: filterState.endDate,
    page: filterState.page,
    limit: 20,
  });

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
    mutate();
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteItem({
      confirmMessage: 'Sei sicuro di voler eliminare questo cliente?',
      action: () => customerApi.delete(id),
      successMessage: 'Cliente eliminato',
      errorMessage: "Errore durante l'eliminazione del cliente",
      onSuccess: mutate,
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 1.5, pt: 1 }}>
      <PageHeader
        title="Clienti"
        showButton
        buttonLabel="Nuovo Cliente"
        buttonIcon={<Icon name="plus" size={18} />}
        buttonRequiresAdmin
        onButtonClick={() => setIsModalOpen(true)}
        filters={
          <CustomerFilters
            search={filterState.search}
            startDate={filterState.startDate}
            endDate={filterState.endDate}
            onSearchChange={filterState.setSearch}
            onStartDateChange={filterState.setStartDate}
            onEndDateChange={filterState.setEndDate}
            onResetDates={filterState.resetDates}
          />
        }
      />

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <CustomerDataTable
          customers={data?.data || []}
          columns={columns}
          isLoading={isLoading}
          debouncedSearch={filterState.debouncedSearch}
          page={filterState.page}
          totalPages={data?.totalPages || 0}
          total={data?.total || 0}
          onPrevPage={() => filterState.setPage((p) => Math.max(1, p - 1))}
          onNextPage={() => filterState.setPage((p) => p + 1)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Box>

      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCustomer(null);
        }}
        onSuccess={handleModalSuccess}
        customer={editingCustomer}
      />
      <ConfirmDialog {...confirmDialogProps} />
    </Box>
  );
}
