"use client";

import dynamic from 'next/dynamic';

import StatePanel from '@/components/feedback/StatePanel';
import SearchInput from '@/components/forms/SearchInput';
import PageHeader from '@/components/layout/PageHeader';
import PaginationControls from '@/components/feedback/PaginationControls';
import Avatar from '@/components/data-display/Avatar';
import DataTable, { type Column } from '@/components/data-display/DataTable';
import Button from '@/components/ui/Button';
import PermissionGate from '@/components/auth/PermissionGate';
import { useAuth } from '@/context/AuthContext';
import { DEBOUNCE_SEARCH_DELAY, EXPORT_FETCH_LIMIT } from '@/config/env';
import { useCustomers } from '@/hooks/domain';
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
        <div className="flex items-center gap-3">
          <Avatar firstName={customer.firstName} lastName={customer.lastName} />
          <div>
            <div className="text-white font-semibold leading-tight">
              {customer.firstName} {customer.lastName}
            </div>
            {customer.notes && (
              <div className="text-xs text-text-secondary truncate max-w-[220px] mt-0.5">{customer.notes}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Telefono',
      width: '160px',
      render: (customer) => (
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Phone size={13} className="text-accent shrink-0" />
          <span className="font-mono tracking-wide">{customer.phone}</span>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (customer) => customer.email ? (
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Mail size={13} className="text-accent shrink-0" />
          <span className="truncate max-w-[200px]">{customer.email}</span>
        </div>
      ) : <span className="text-text-secondary/40 text-sm">—</span>,
    },
    {
      key: 'createdAt',
      label: 'Iscritto il',
      width: '130px',
      render: (customer) => (
        <span className="text-sm text-text-secondary tabular-nums">
          {customer.createdAt ? format(new Date(customer.createdAt), 'dd MMM yyyy', { locale: it }) : '—'}
        </span>
      ),
    },
    {
      key: 'bookings',
      label: 'Prenotazioni',
      align: 'center',
      width: '110px',
      render: (customer) => (
        <div className="flex justify-center">
          <span className="inline-flex items-center justify-center min-w-[32px] h-7 px-2.5 rounded-full bg-accent/10 text-accent font-bold text-xs tabular-nums">
            {customer._count?.bookings || 0}
          </span>
        </div>
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
    <div className="flex-1 flex flex-col gap-6">
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
                icon={UserPlus}
                onClick={() => { setEditingCustomer(null); setIsModalOpen(true); }}
              >
                Nuovo Cliente
              </Button>
            </PermissionGate>
          </>
        }
      >
        <div className="flex-1 flex items-center gap-4 max-w-2xl mx-auto">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={(v) => { setSearch(v); setPage(1); }}
              placeholder="Cerca per nome, cognome o telefono..."
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="rounded-lg border border-surface-border bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-accent w-36"
            />
            <span className="text-text-secondary text-sm">—</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="rounded-lg border border-surface-border bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-accent w-36"
            />
            {(startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="text-xs"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
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
        <div className="flex-1 flex flex-col overflow-hidden">
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
              <div className="flex items-center justify-center gap-2 w-full">
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
                      className="text-danger/60 hover:text-danger hover:bg-danger/10"
                      title="Elimina"
                      onClick={() => handleDelete(customer.id)}
                    />
                  </>
                </PermissionGate>
              </div>
            )}
          />

          {totalPages > 1 && (
            <div className="bg-white/2 border-t border-surface-border">
              <PaginationControls
                page={page}
                totalPages={totalPages}
                total={result?.total ?? 0}
                onPrev={() => setPage(p => Math.max(1, p - 1))}
                onNext={() => setPage(p => Math.min(totalPages, p + 1))}
                label="clienti"
              />
            </div>
          )}
        </div>
      )}

      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => mutate()}
        customer={editingCustomer}
      />
      <ConfirmDialog {...confirmDialogProps} />
    </div>
  );
}
