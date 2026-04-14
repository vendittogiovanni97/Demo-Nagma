"use client";

import { Skeleton } from '@/components/feedback/Skeleton';
import CustomerModal from '@/components/modals/CustomerModal';
import ExportModal from '@/components/modals/ExportModal';
import { DEBOUNCE_SEARCH_DELAY, EXPORT_FETCH_LIMIT } from '@/config/defaults';
import { useAuth } from '@/context/AuthContext';
import { useCustomers } from '@/hooks/domain';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { customerService } from '@/services/customer.service';
import type { Customer } from '@/types/customer';
import { canManageCustomers, canSendWhatsApp } from '@/utils/permissions';
import { notifyError, notifySuccess } from '@/utils/toast';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Edit, Eye, Mail, MessageCircle, Phone, Search, Trash2, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

export default function CustomersPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const debouncedSearch = useDebouncedValue(search, DEBOUNCE_SEARCH_DELAY);
  const canManage = canManageCustomers(user?.role);
  const canSendMessages = canSendWhatsApp(user?.role);

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

  const handleDelete = async (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questo cliente?')) {
      try {
        await customerService.delete(id);
        notifySuccess('Cliente eliminato');
        mutate();
      } catch (err: unknown) {
        notifyError(err, 'Errore durante l\'eliminazione');
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Header: Title left, Search center, Actions right */}
      <div className="flex items-center justify-between gap-4">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-outfit font-bold text-white">Anagrafica Clienti</h1>
        </div>

        {/* Search - Center */}
        <div className="flex-1 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input
              type="text"
              placeholder="Cerca per nome, cognome o telefono..."
              className="w-full bg-white/5 border border-surface-border rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-accent transition-all"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
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
          {canManage ? (
            <button
              onClick={() => { setEditingCustomer(null); setIsModalOpen(true); }}
              className="btn-primary flex items-center gap-2 px-6"
            >
              <UserPlus size={20} />
              <span>Nuovo Cliente</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel flex-1 flex flex-col overflow-hidden rounded-2xl">
        {error ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Impossibile caricare i clienti</h3>
              <p className="text-sm text-text-secondary">Riprova tra qualche secondo o aggiorna la pagina.</p>
            </div>
          </div>
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
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">
                        {debouncedSearch ? 'Nessun risultato trovato' : 'Nessun cliente presente'}
                      </h3>
                      <p className="text-sm text-text-secondary max-w-sm mx-auto">
                        {debouncedSearch
                          ? 'Prova a modificare i termini di ricerca.'
                          : 'Clicca "Nuovo Cliente" per aggiungere il primo contatto.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-surface-border/50 hover:bg-white/2 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-accent/20 to-accent/5 flex items-center justify-center text-accent font-bold text-sm shrink-0">
                          {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                        </div>
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
                        {canSendMessages ? (
                          <Link
                            href={`/whatsapp?customerId=${customer.id}&customerName=${encodeURIComponent(`${customer.firstName} ${customer.lastName}`)}&customerPhone=${encodeURIComponent(customer.phone)}`}
                            className="p-2 hover:bg-white/10 rounded-lg text-text-secondary hover:text-emerald-400 transition"
                            title="Invia WhatsApp"
                          >
                            <MessageCircle size={16} />
                          </Link>
                        ) : null}
                        {canManage ? (
                          <>
                            <button
                              onClick={() => { setEditingCustomer(customer); setIsModalOpen(true); }}
                              className="p-2 hover:bg-white/10 rounded-lg text-text-secondary hover:text-accent transition"
                              title="Modifica"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(customer.id)}
                              className="p-2 hover:bg-white/10 rounded-lg text-text-secondary hover:text-danger transition"
                              title="Elimina"
                            >
                              <Trash2 size={16} />
                            </button>
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
          <div className="flex items-center justify-between p-4 border-t border-surface-border bg-white/2">
            <span className="text-sm text-text-secondary">
              Pagina {page} di {totalPages} · {result?.total ?? 0} clienti
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg border border-surface-border hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg border border-surface-border hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
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
