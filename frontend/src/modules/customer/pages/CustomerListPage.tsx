"use client";

import PageHeader from '@/common/components/common/PageHeader';
import DataTable, { type FetchParams, type TableAction } from '@/common/components/table/DataTable';
import Icon from '@/common/components/ui/Icon';
import { useAuth } from '@/common/context/AuthContext';
import { Box } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { customerApi } from '../api/customer.api';
import CustomerCard from '../components/CustomerCard';
import CustomerDetailModal from '../components/modals/CustomerDetailModal';
import CustomerFilters from '../components/CustomerFilters';
import CustomerModal from '../components/modals/CustomerModal';
import { useCustomerColumns } from '../hooks/useCustomerColumns';
import { useCustomersFilter } from '../hooks/useCustomersFilter';
import type { CustomerModel as Customer } from '../model/customer.model';

export default function CustomerListPage() {
  const { isAdmin } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [viewId, setViewId] = useState<number | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const filterState = useCustomersFilter();
  const columns = useCustomerColumns();

  const handleDelete = useCallback(async (customer: Customer) => {
    await customerApi.delete(customer.id);
  }, []);

  const openCustomerModal = useCallback((customer: Customer | null) => {
    setEditingCustomer(customer);
    setIsCustomerModalOpen(true);
  }, []);

  const getRowActions = useCallback(
    (customer: Customer): TableAction[] => [
      {
        id: 'view',
        label: 'Visualizza',
        icon: 'vedi',
        tone: 'primary',
        onClick: () => setViewId(customer.id),
      },
      {
        id: 'edit',
        label: 'Modifica',
        icon: 'pencil',
        tone: 'primary',
        hidden: !isAdmin,
        onClick: () => openCustomerModal(customer),
      },
    ],
    [isAdmin, openCustomerModal]
  );

  const fetchCustomers = useCallback(async (params: FetchParams) => {
    const response = await customerApi.getAll({
      page: params.page,
      limit: params.limit,
      search: filterState.debouncedSearch || params.search,
      startDate: filterState.startDate,
      endDate: filterState.endDate,
    });
    return {
      ...response,
      data: response.data.map((customer): Customer => ({
        ...customer,
        fullName: `${customer.firstName} ${customer.lastName}`.trim(),
        email: customer.email ?? '',
        notes: customer.notes ?? '',
        totalBookings: customer._count?.bookings ?? 0,
      })),
    };
  }, [filterState.startDate, filterState.endDate, filterState.debouncedSearch]);

  const refreshKey = useMemo(() => {
    return `${filterState.debouncedSearch || ''}_${filterState.startDate || ''}_${filterState.endDate || ''}_${refreshTrigger}`;
  }, [filterState.debouncedSearch, filterState.startDate, filterState.endDate, refreshTrigger]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 1.5, pt: 1 }}>
      <PageHeader
        title="Clienti"
        showButton
        buttonLabel="Nuovo Cliente"
        buttonIcon={<Icon name="plus" size={18} />}
        buttonRequiresAdmin
        onButtonClick={() => openCustomerModal(null)}
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
        <DataTable<Customer>
          columns={columns}
          baseColumns={['id']}
          hideState={true}
          fetchData={fetchCustomers}
          refreshKey={refreshKey}
          keyExtractor={(c) => c.id}
          onDelete={isAdmin ? handleDelete : undefined}
          rowActions={getRowActions}
          deleteConfirmMessage="Sei sicuro di voler eliminare questo cliente?"
          emptyTitle="Nessun cliente presente"
          emptyDescription="Clicca 'Nuovo Cliente' per aggiungere il primo contatto."
          renderCard={(customer) => (
            <CustomerCard
              customer={customer}
              onEdit={(selected) => openCustomerModal(selected)}
              onDelete={() => handleDelete(customer)}
            />
          )}
        />
      </Box>

      <CustomerDetailModal
        id={viewId}
        isOpen={viewId !== null}
        onClose={() => {
          setViewId(null);
          setRefreshTrigger((t) => t + 1);
        }}
      />

      <CustomerModal
        isOpen={isCustomerModalOpen}
        customer={editingCustomer}
        onClose={() => setIsCustomerModalOpen(false)}
        onSuccess={() => {
          setIsCustomerModalOpen(false);
          setRefreshTrigger((current) => current + 1);
        }}
      />
    </Box>
  );
}
