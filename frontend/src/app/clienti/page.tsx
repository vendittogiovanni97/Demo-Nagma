"use client";

import dynamic from 'next/dynamic';

import PaginationControls from '@/components/feedback/PaginationControls';
import StatePanel from '@/components/feedback/StatePanel';
import SearchInput from '@/components/forms/SearchInput';
import PageHeader from '@/components/layout/PageHeader';
import Avatar from '@/components/data-display/Avatar';
import DataTable, { type Column } from '@/components/data-display/DataTable';
import Button from '@/components/ui/Button';
import PermissionGate from '@/components/auth/PermissionGate';
import { useAuth } from '@/context/AuthContext';
import { DEBOUNCE_SEARCH_DELAY, EXPORT_FETCH_LIMIT } from '@/config/env';
import { useCustomers } from '@/hooks/domain/useCustomers';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { customerService } from '@/services/customer.service';
import type { Customer } from '@/types/customer';

import CustomerModal from '@/components/modals/CustomerModal';
import ExportModal, { type ExportFilter } from '@/components/modals/ExportModal';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Edit, Eye, Mail, MessageCircle, Phone, Trash2, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Box, Stack, TextField, Typography, useTheme } from '@mui/material';

export default function CustomersPage() {
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const debouncedSearch = useDebouncedValue(search, DEBOUNCE_SEARCH_DELAY);
  const { deleteItem, confirmDialogProps } = useDeleteConfirm();

  const { data: result, mutate, isLoading, error } = useCustomers({ search: debouncedSearch, page, startDate, endDate });
  const customers = result?.data;
  const totalPages = result?.totalPages ?? 1;

  const theme = useTheme();

  const handleSearch = () => {
    setPage(1);
  };

  const exportColumns = useMemo(() => [
    { label: 'Nome', value: (customer: Customer) => `${customer.firstName} ${customer.lastName}` },
    { label: 'Telefono', value: (customer: Customer) => customer.phone },
    { label: 'Email', value: (customer: Customer) => customer.email || '' },
    { label: 'Note', value: (customer: Customer) => customer.notes || '' },
    {
      label: 'Creato il',
      value: (customer: Customer) =>
        format(new Date(customer.createdAt), 'dd/MM/yyyy', { locale: it }),
    },
    { label: 'Appuntamenti', value: (customer: Customer) => customer._count?.bookings || 0 },
  ], []);

  const exportFilters: ExportFilter<Customer>[] = useMemo(() => [
    {
      key: 'nome',
      label: 'Nome',
      type: 'text',
      placeholder: 'Cerca per nome...',
      filterFn: (c, v) =>
        `${c.firstName ?? ''} ${c.lastName ?? ''}`.toLowerCase().includes(v.toLowerCase()),
    },
    {
      key: 'telefono',
      label: 'Telefono',
      type: 'text',
      placeholder: 'Cerca per telefono...',
      filterFn: (c, v) => c.phone?.includes(v) ?? false,
    },
    {
      key: 'appuntamenti',
      label: 'Appuntamenti',
      type: 'select',
      options: [
        { value: '', label: 'Qualsiasi' },
        { value: '0', label: 'Nessuno' },
        { value: '1+', label: '1 o più' },
      ],
      filterFn: (c, v) => {
        const count = c._count?.bookings || 0;
        if (v === '0') return count === 0;
        if (v === '1+') return count >= 1;
        return true;
      },
    },
  ], [debouncedSearch]);

  const customerColumns: Column<Customer>[] = useMemo(() => [
    {
      key: 'cliente',
      label: 'Cliente',
      render: (customer) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar firstName={customer.firstName} lastName={customer.lastName} />
          <Box>
            <Box sx={{ fontWeight: 600, lineHeight: 1.25, color: theme.palette.text.primary }}>
              {customer.firstName} {customer.lastName}
            </Box>
            {customer.notes && (
              <Box sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary, overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '220px', mt: 0.5 }}>
                {customer.notes}
              </Box>
            )}
          </Box>
        </Box>
      ),
    },
    {
      key: 'phone',
      label: 'Telefono',
      width: '160px',
      render: (customer) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.875rem', color: theme.palette.text.secondary }}>
          <Phone size={13} style={{ color: theme.palette.primary.main, flexShrink: 0 }} />
          <Box component="span" sx={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>
            {customer.phone}
          </Box>
        </Box>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (customer) => customer.email ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.875rem', color: theme.palette.text.secondary }}>
          <Mail size={13} style={{ color: theme.palette.primary.main, flexShrink: 0 }} />
          <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
            {customer.email}
          </Box>
        </Box>
      ) : <Box component="span" sx={{ fontSize: '0.875rem', color: 'rgba(244,67,54,0.4)' }}>—</Box>,
    },
    {
      key: 'createdAt',
      label: 'Iscritto il',
      width: '130px',
      render: (customer) => (
        <Box component="span" sx={{ fontSize: '0.875rem', color: theme.palette.text.secondary, fontVariant: 'tabular-nums' }}>
          {customer.createdAt ? format(new Date(customer.createdAt), 'dd MMM yyyy', { locale: it }) : '—'}
        </Box>
      ),
    },
    {
      key: 'bookings',
      label: 'Prenotazioni',
      align: 'center',
      width: '110px',
      render: (customer) => (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Box sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '32px',
            height: '28px',
            px: 2.5,
            borderRadius: '9999px',
            backgroundColor: 'rgba(0, 191, 255, 0.1)',
            color: theme.palette.primary.main,
            fontWeight: 700,
            fontSize: '0.75rem',
            fontVariant: 'tabular-nums',
          }}>
            {customer._count?.bookings || 0}
          </Box>
        </Box>
      ),
    },
  ], []);

  const handleDelete = async (id: number) => {
    await deleteItem({
      confirmMessage: 'Sei sicuro di voler eliminare questo cliente?',
      action: () => customerService.delete(id),
      successMessage: 'Cliente eliminato',
      errorMessage: 'Errore durante l\'eliminazione',
      onSuccess: mutate,
    });
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <PageHeader
        title="Anagrafica Clienti"
        actions={
          <>
            <ExportModal
              filenameBase="clienti"
              title="Anagrafica Clienti"
              rows={customers || []}
              columns={exportColumns}
              filters={exportFilters}
              filtersLabel={`Ricerca: ${debouncedSearch || 'nessuna'}`}
              resolveRows={async () => {
                const response = await customerService.getAll(debouncedSearch, 1, EXPORT_FETCH_LIMIT);
                return response.data;
              }}
            />
            <PermissionGate requireAdmin>
              <Button
                variant="primary"
                icon={<UserPlus />}
                onClick={() => { setEditingCustomer(null); setIsModalOpen(true); }}
              >
                Nuovo Cliente
              </Button>
            </PermissionGate>
          </>
        }
      >
        <Stack
          direction="row"
          useFlexGap
          sx={{
            gap: 0.875,
            alignItems: 'center',
            justifyContent: { xs: 'flex-start', xl: 'center' },
            flex: '1 1 auto',
            minWidth: 0,
            flexWrap: { xs: 'wrap', xl: 'nowrap' },
          }}
        >
          <Box
            sx={{
              flex: { xs: '1 1 100%', md: '1 1 280px' },
              minWidth: { xs: '100%', xl: 280 },
              maxWidth: { xs: '100%', xl: 360 },
            }}
          >
            <SearchInput
              value={search}
              onChange={(v) => { setSearch(v); setPage(1); }}
              placeholder="Cerca per nome, cognome o telefono..."
            />
          </Box>

          <Stack
            direction="row"
            useFlexGap
            sx={{
              gap: 0.625,
              alignItems: 'center',
              flexShrink: 0,
              flexWrap: { xs: 'wrap', md: 'nowrap' },
            }}
          >
            <TextField
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              size="small"
              sx={{ width: 126 }}
            />
            <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.75rem' }}>—</Typography>
            <TextField
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              size="small"
              sx={{ width: 126 }}
            />
            {(startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setStartDate(''); setEndDate(''); }}
              >
                Reset
              </Button>
            )}
          </Stack>
        </Stack>
      </PageHeader>

      {error && (
        <StatePanel
          variant="error"
          fullPage
          title="Impossibile caricare i clienti"
          description="Riprova tra qualche secondo o aggiorna la pagina."
        />
      )}

      {!error && (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <DataTable<Customer>
            columns={customerColumns}
            data={customers || []}
            isLoading={isLoading}
            emptyMessage={
              debouncedSearch
                ? 'Nessun risultato trovato. Prova a modificare i termini di ricerca.'
                : 'Nessun cliente presente. Clicca "Nuovo Cliente" per aggiungere il primo contatto.'
            }
            keyExtractor={(c) => c.id}
            actions={(customer) => (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, width: '100%' }}>
                <Button
                  variant="icon"
                  icon={<Eye size={18} />}
                  title="Dettagli"
                  onClick={() => window.location.href = `/clienti/${customer.id}`}
                />
                <PermissionGate requireAdmin>
                  <Button
                    variant="icon"
                    icon={<MessageCircle size={18} />}
                    title="WhatsApp"
                    onClick={() => window.location.href = `/whatsapp?customerId=${customer.id}&customerName=${encodeURIComponent(`${customer.firstName} ${customer.lastName}`)}&customerPhone=${encodeURIComponent(customer.phone)}`}
                  />
                </PermissionGate>
                <PermissionGate requireAdmin>
                  <>
                    <Button
                      variant="icon"
                      icon={<Edit size={18} />}
                      title="Modifica"
                      onClick={() => { setEditingCustomer(customer); setIsModalOpen(true); }}
                    />
                    <Button
                      variant="icon"
                      icon={<Trash2 size={18} />}
                      sx={{
                        color: 'rgba(244,67,54,0.6)',
                        '&:hover': { color: theme.palette.error.main, backgroundColor: 'rgba(244,67,54,0.1)' },
                      }}
                      title="Elimina"
                      onClick={() => handleDelete(customer.id)}
                    />
                  </>
                </PermissionGate>
              </Box>
            )}
          />

          {totalPages > 1 && (
            <Box sx={{ borderTop: `1px solid ${theme.palette.divider}`, bgcolor: 'rgba(255,255,255,0.02)' }}>
              <PaginationControls
                page={page}
                totalPages={totalPages}
                total={result?.total ?? 0}
                onPrev={() => setPage(p => Math.max(1, p - 1))}
                onNext={() => setPage(p => Math.min(totalPages, p + 1))}
                label="clienti"
              />
            </Box>
          )}
        </Box>
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
