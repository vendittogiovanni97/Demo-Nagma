"use client";

import PageHeader from '@/common/components/common/PageHeader';
import DataTable from '@/common/components/data-display/DataTable';
import { useAuth } from '@/common/context/AuthContext';
import { Box } from '@mui/material';
import Icon from '@/common/components/ui/Icon';
import { useCallback, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { customerApi } from '../api/customer.api';
import CustomerFilters from '../components/CustomerFilters';
import CustomerModal from '../components/modals/CustomerModal';
import { useCustomerColumns } from '../hooks/useCustomerColumns';
import { useCustomersFilter } from '../hooks/useCustomersFilter';
import type { CustomerModel as Customer } from '../model/customer.model';
import CustomerCard from '../components/CustomerCard';
import type { FetchParams } from '@/common/components/data-display/DataTable';

export default function CustomerListPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const filterState = useCustomersFilter();
  const columns = useCustomerColumns();

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

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
        <DataTable<Customer>
          columns={columns}
          baseColumns={['id']}
          fetchData={fetchCustomers}
          queryKey="customers"
          refreshKey={refreshKey as any}
          keyExtractor={(c) => c.id}
          onRowClick={(c) => router.push(`/clienti/${c.id}`)}
          onEdit={isAdmin ? handleEdit : undefined}
          onDelete={isAdmin ? handleDelete : undefined}
          deleteConfirmMessage="Sei sicuro di voler eliminare questo cliente?"
          pageSize={20}
          emptyTitle="Nessun cliente presente"
          emptyDescription="Clicca 'Nuovo Cliente' per aggiungere il primo contatto."
          renderCard={(customer) => (
            <CustomerCard
              customer={customer}
              onEdit={handleEdit}
              onDelete={() => handleDelete(customer)}
            />
          )}
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
    </Box>
  );
}
