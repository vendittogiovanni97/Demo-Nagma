"use client";

import PageHeader from '@/common/components/common/PageHeader';
import type { FetchParams } from '@/common/components/table/DataTable';
import DataTable, { DataTableRef } from '@/common/components/table/DataTable';
import Icon from '@/common/components/ui/Icon';
import { useAuth } from '@/common/context/AuthContext';
import { Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef, useState } from 'react';
import { customerApi } from '../api/customer.api';
import CustomerCard from '../components/CustomerCard';
import CustomerFilters from '../components/CustomerFilters';
import CustomerModal from '../components/modals/CustomerModal';
import { useCustomerColumns } from '../hooks/useCustomerColumns';
import { useCustomersFilter } from '../hooks/useCustomersFilter';
import type { CustomerModel as Customer } from '../model/customer.model';

export default function CustomerListPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const tableRef = useRef<DataTableRef>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const filterState = useCustomersFilter();
  const columns = useCustomerColumns();

  const handleDelete = useCallback(async (customer: Customer) => {
    await customerApi.delete(customer.id);
  }, []);

  const fetchCustomers = useCallback(async (params: FetchParams) => {
    return customerApi.getAll({
      page: params.page,
      limit: params.limit,
      search: params.search,
      startDate: filterState.startDate,
      endDate: filterState.endDate,
    });
  }, [filterState.startDate, filterState.endDate]);

  const refreshKey = useMemo(() => {
    return `${filterState.startDate || ''}_${filterState.endDate || ''}_${refreshTrigger}`;
  }, [filterState.startDate, filterState.endDate, refreshTrigger]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 1.5, pt: 1 }}>
      <PageHeader
        title="Clienti"
        showButton
        buttonLabel="Nuovo Cliente"
        buttonIcon={<Icon name="plus" size={18} />}
        buttonRequiresAdmin
        onButtonClick={() => tableRef.current?.openCreateModal()}
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
          ref={tableRef}
          columns={columns}
          baseColumns={['id']}
          hideState={true}
          fetchData={fetchCustomers}
          queryKey="customers"
          refreshKey={refreshKey as any}
          keyExtractor={(c) => c.id}
          onRowClick={(c) => router.push(`/clienti/${c.id}`)}
          onDelete={isAdmin ? handleDelete : undefined}
          deleteConfirmMessage="Sei sicuro di voler eliminare questo cliente?"
          pageSize={20}
          emptyTitle="Nessun cliente presente"
          emptyDescription="Clicca 'Nuovo Cliente' per aggiungere il primo contatto."
          openEntityModal={isAdmin ? (action, customer, onClose, onSuccess) => (
            <CustomerModal
              isOpen
              customer={customer}
              onClose={onClose || (() => {})}
              onSuccess={onSuccess || (() => {})}
            />
          ) : undefined}
          renderCard={(customer) => (
            <CustomerCard
              customer={customer}
              onEdit={(c) => tableRef.current?.openEditModal(c)}
              onDelete={() => handleDelete(customer)}
            />
          )}
        />
      </Box>
    </Box>
  );
}
