"use client";

import PageContainer from '@/common/components/layout/PageContainer';
import PageHeader from '@/common/components/common/PageHeader';
import SmartFilters from '@/common/components/common/SmartFilters';
import DataTable, { type FetchParams, type TableAction } from '@/common/components/table/DataTable';
import { CancelButton } from '@/common/components/ui/Button';
import Icon from '@/common/components/ui/Icon';
import { useAuth } from '@/common/context/AuthContext';
import { Box } from '@mui/material';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { EXPORT_FETCH_LIMIT } from '@/common/config/env';
import type { ExportFilter } from '@/common/components/modals/ExportModal';
import { useCallback, useMemo, useState } from 'react';
import { customerApi } from '../api/customer.api';
import CustomerCard from '../components/CustomerCard';
import CustomerDetail from '../components/CustomerDetail';
import CustomerModal from '../components/modals/CustomerModal';
import SmartModal from '@/common/components/common/SmartModal';
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

  const exportColumns = useMemo(() => [
    { label: 'Cliente', value: (c: Customer) => c.fullName },
    { label: 'Telefono', value: (c: Customer) => c.phone },
    { label: 'Email', value: (c: Customer) => c.email },
    { label: 'Data di nascita', value: (c: Customer) => (c.birthDate ? format(parseISO(c.birthDate), 'dd/MM/yyyy') : '') },
    { label: 'Iscritto il', value: (c: Customer) => format(parseISO(c.createdAt), 'dd/MM/yyyy', { locale: it }) },
    { label: 'Prenotazioni', value: (c: Customer) => c.totalBookings },
    { label: 'Note', value: (c: Customer) => c.notes },
  ], []);

  const exportFilters = useMemo<ExportFilter<Customer>[]>(() => [
    {
      key: 'cliente',
      label: 'Cliente',
      type: 'text',
      placeholder: 'Cerca per nome...',
      filterFn: (c, v) => c.fullName.toLowerCase().includes(v.toLowerCase()),
    },
    {
      key: 'giorno',
      label: 'Giorno',
      type: 'date',
      filterFn: (c, v) => !v || format(parseISO(c.createdAt), 'yyyy-MM-dd') === v,
    },
    {
      key: 'mese',
      label: 'Mese',
      type: 'month',
      filterFn: (c, v) => !v || format(parseISO(c.createdAt), 'yyyy-MM') === v,
    },
  ], []);

  const refreshKey = useMemo(() => {
    return `${filterState.debouncedSearch || ''}_${filterState.startDate || ''}_${filterState.endDate || ''}_${refreshTrigger}`;
  }, [filterState.debouncedSearch, filterState.startDate, filterState.endDate, refreshTrigger]);



  return (
    <PageContainer pt={1}>
      <PageHeader
        title="Clienti"
        exportConfig={{
          filenameBase: 'clienti',
          title: 'Clienti',
          rows: [],
          columns: exportColumns,
          filters: exportFilters,
          filtersLabel: [
            filterState.debouncedSearch && `Ricerca: ${filterState.debouncedSearch}`,
            filterState.startDate && `Dal: ${filterState.startDate}`,
            filterState.endDate && `Al: ${filterState.endDate}`,
          ].filter(Boolean).join(' · ') || undefined,
          resolveRows: async () => {
            const res = await customerApi.getAll({
              page: 1,
              limit: EXPORT_FETCH_LIMIT,
              search: filterState.debouncedSearch || undefined,
              startDate: filterState.startDate || undefined,
              endDate: filterState.endDate || undefined,
            });
            return res.data.map((customer): Customer => ({
              ...customer,
              fullName: `${customer.firstName} ${customer.lastName}`.trim(),
              email: customer.email ?? '',
              notes: customer.notes ?? '',
              totalBookings: customer._count?.bookings ?? 0,
            }));
          },
        }}
        showButton
        buttonLabel="Nuovo Cliente"
        buttonIcon={<Icon name="plus" size={18} />}
        buttonRequiresAdmin
        onButtonClick={() => openCustomerModal(null)}
        filters={
          <SmartFilters
            alignWithMonthPicker
            search={{
              value: filterState.search,
              onChange: filterState.setSearch,
              placeholder: "Cerca cliente...",
            }}
            dateRange={{
              start: { value: filterState.startDate, onChange: filterState.setStartDate },
              end: { value: filterState.endDate, onChange: filterState.setEndDate },
            }}
          >
            {(filterState.startDate || filterState.endDate) && (
              <CancelButton
                variant="ghost"
                size="sm"
                onClick={filterState.resetDates}
                icon={<Icon name="x" size={14} />}
                sx={{ fontSize: '0.75rem', px: 1 }}
              >
                Reset
              </CancelButton>
            )}
          </SmartFilters>
        }
      />

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DataTable<Customer>
          columns={columns}
          baseColumns={['id']}
          fetchData={fetchCustomers}
          refreshKey={refreshKey}
          keyExtractor={(c) => c.id}
          hideToolbar
          onDelete={isAdmin ? handleDelete : undefined}
          rowActions={getRowActions}
          emptyTitle="Nessun cliente presente"
          emptyDescription="Clicca 'Nuovo Cliente' per aggiungere il primo contatto."
          renderCard={(customer) => (
            <CustomerCard
              customer={customer}
              onEdit={(selected) => openCustomerModal(selected)}
              onDelete={() => handleDelete(customer)}
              onView={(selected) => setViewId(selected.id)}
            />
          )}
        />
      </Box>

      <SmartModal
        isOpen={viewId !== null}
        onClose={() => {
          setViewId(null);
          setRefreshTrigger((t) => t + 1);
        }}
        title="Scheda Cliente"
        maxWidth="lg"
        showFooter={false}
      >
        {viewId != null && (
          <CustomerDetail
            id={viewId}
            embedded
            onClose={() => {
              setViewId(null);
              setRefreshTrigger((t) => t + 1);
            }}
          />
        )}
      </SmartModal>

      <CustomerModal
        isOpen={isCustomerModalOpen}
        customer={editingCustomer}
        onClose={() => setIsCustomerModalOpen(false)}
        onSuccess={() => {
          setIsCustomerModalOpen(false);
          setRefreshTrigger((current) => current + 1);
        }}
      />
    </PageContainer>
  );
}
