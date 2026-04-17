"use client";

import { Skeleton } from '@/components/feedback/Skeleton';
import StatePanel from '@/components/feedback/StatePanel';
import SearchInput from '@/components/forms/SearchInput';
import PageHeader from '@/components/layout/PageHeader';
import PaginationControls from '@/components/feedback/PaginationControls';
import Avatar from '@/components/data-display/Avatar';
import Button from '@/components/ui/Button';
import CustomerModal from '@/components/modals/CustomerModal';
import ExportModal from '@/components/modals/ExportModal';
import { DEBOUNCE_SEARCH_DELAY, EXPORT_FETCH_LIMIT } from '@/config/defaults';
import { useAuth } from '@/context/AuthContext';
import { useCustomers } from '@/hooks/domain';
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { customerService } from '@/services/customer.service';
import type { Customer } from '@/types/customer';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Edit, Eye, Mail, MessageCircle, Phone, Trash2, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

export default function CustomersPage() {
  const { can } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const debouncedSearch = useDebouncedValue(search, DEBOUNCE_SEARCH_DELAY);
  const { deleteItem } = useDeleteConfirm();

  const { data: result, mutate, isLoading, error } = useCustomers({ search: debouncedSearch, page });
  const customers = result?.data;
  const totalPages = result?.totalPages ?? 1;
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
              filtersLabel={`Ricerca: ${debouncedSearch || 'nessuna'}`}
              resolveRows={async () => {
                const response = await customerService.getAll(debouncedSearch, 1, EXPORT_FETCH_LIMIT);
                return response.data;
              }}
            />
            {can.manageCustomers ? (
              <Button
                variant="primary"
                icon={UserPlus}
                onClick={() => { setEditingCustomer(null); setIsModalOpen(true); }}
              >
                Nuovo Cliente
              </Button>
            ) : null}
          </>
        }
      >
        <div className="flex-1 max-w-md mx-auto">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Cerca per nome, cognome o telefono..."
          />
        </div>
      </PageHeader>

      {/* Table */}
      <div className="glass-panel flex-1 flex flex-col overflow-hidden rounded-2xl">
        {error ? (
          <StatePanel
            variant="error"
            fullPage
            title="Impossibile caricare i clienti"
            description="Riprova tra qualche secondo o aggiorna la pagina."
          />
        ) : null}

        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="py-4 px-6 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Cliente</th>
                <th className="py-4 px-6 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Contatti</th>
                <th className="py-4 px-6 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Creato il</th>
                <th className="py-4 px-6 text-center text-xs font-bold text-text-secondary uppercase tracking-wider">Appuntamenti</th>
                <th className="py-4 px-6 text-right text-xs font-bold text-text-secondary uppercase tracking-wider">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [1, 2, 3, 4, 5, 6].map((i) => (
                  <tr key={i} className="border-b border-surface-border/50">
                    <td className="py-4 px-6"><Skeleton variant="text" className="w-32" /></td>
                    <td className="py-4 px-6"><Skeleton variant="text" className="w-40" /></td>
                    <td className="py-4 px-6"><Skeleton variant="text" className="w-20" /></td>
                    <td className="py-4 px-6"><Skeleton variant="circle" className="w-8 h-8 mx-auto" /></td>
                    <td className="py-4 px-6"><Skeleton variant="rect" className="w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : !customers || customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20">
                    <StatePanel
                      variant="empty"
                      title={debouncedSearch ? 'Nessun risultato trovato' : 'Nessun cliente presente'}
                      description={debouncedSearch
                        ? 'Prova a modificare i termini di ricerca.'
                        : 'Clicca "Nuovo Cliente" per aggiungere il primo contatto.'}
                      className="border-none bg-transparent"
                    />
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-surface-border/50 hover:bg-white/2 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Avatar firstName={customer.firstName} lastName={customer.lastName} />
                        <div>
                          <div className="text-white font-semibold">{customer.firstName} {customer.lastName}</div>
                          {customer.notes && (
                            <div className="text-xs text-text-secondary truncate max-w-xs">{customer.notes}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                          <Phone size={14} className="text-accent shrink-0" />
                          <span>{customer.phone}</span>
                        </div>
                        {customer.email && (
                          <div className="flex items-center gap-2 text-sm text-text-secondary">
                            <Mail size={14} className="text-accent shrink-0" />
                            <span className="truncate">{customer.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-text-secondary">
                        {customer.createdAt ? format(new Date(customer.createdAt), 'dd MMM yyyy', { locale: it }) : '-'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent font-bold text-sm">
                          {customer._count?.bookings || 0}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/clienti/${customer.id}`}
                          className="p-2 hover:bg-white/10 rounded-lg text-text-secondary hover:text-white transition"
                          title="Dettagli"
                        >
                          <Eye size={16} />
                        </Link>
                        {can.sendWhatsApp ? (
                          <Link
                            href={`/whatsapp?customerId=${customer.id}&customerName=${encodeURIComponent(`${customer.firstName} ${customer.lastName}`)}&customerPhone=${encodeURIComponent(customer.phone)}`}
                            className="p-2 hover:bg-white/10 rounded-lg text-text-secondary hover:text-emerald-400 transition"
                            title="Invia WhatsApp"
                          >
                            <MessageCircle size={16} />
                          </Link>
                        ) : null}
                        {can.manageCustomers ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setEditingCustomer(customer); setIsModalOpen(true); }}
                              icon={<Edit size={16} />}
                              className="p-2"
                              title="Modifica"
                            />
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(customer.id)}
                              icon={<Trash2 size={16} />}
                              className="p-2"
                              title="Elimina"
                            />
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => mutate()}
        customer={editingCustomer}
      />
    </div>
  );
}
