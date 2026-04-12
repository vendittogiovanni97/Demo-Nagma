"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { customerService } from '@/services/customer.service';
import { Search, UserPlus, Phone, Mail, MoreHorizontal, Eye, Edit, Trash2, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Skeleton } from '@/components/feedback/Skeleton';
import ExportButtons from '@/components/feedback/ExportButtons';
import StatePanel from '@/components/feedback/StatePanel';
import type { Customer } from '@/types/customer';
import PageHeader from '@/components/layout/PageHeader';
import CustomerModal from '@/components/modals/CustomerModal';
import { useAuth } from '@/context/AuthContext';
import { useCustomers } from '@/hooks/domain';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { canManageCustomers, canSendWhatsApp } from '@/utils/permissions';
import { notifyError, notifySuccess } from '@/utils/toast';

export default function CustomersPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const debouncedSearch = useDebouncedValue(search, 250);
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

  // const openEdit = (customer: Customer) => {
  //   setEditingCustomer(customer);
  //   setIsModalOpen(true);
  // };

  // const openNew = () => {
  //   setEditingCustomer(null);
  //   setIsModalOpen(true);
  // };

  // const columns: Column<Customer>[] = [
  //   {
  //     key: 'firstName',
  //     header: 'Nominativo',
  //     render: (_, c) => (
  //       <div className="flex flex-col">
  //         <span className="font-bold font-outfit">{c.firstName} {c.lastName}</span>
  //         <span className="text-xs text-text-secondary italic">{c.notes || 'Nessuna nota'}</span>
  //       </div>
  //     ),
  //   },
  //   {
  //     key: 'phone',
  //     header: 'Contatti',
  //     render: (_, c) => (
  //       <div className="flex flex-col gap-1">
  //         <div className="flex items-center gap-2 text-text-secondary">
  //           <Phone size={14} className="text-accent" /> {c.phone}
  //         </div>
  //         {c.email && (
  //           <div className="flex items-center gap-2 text-text-secondary">
  //             <Mail size={14} className="text-accent" /> {c.email}
  //           </div>
  //         )}
  //       </div>
  //     ),
  //   },
  //   {
  //     key: 'createdAt',
  //     header: 'Prima visita',
  //     render: (val) => (
  //       <span>{val ? format(new Date(val), 'dd MMM yyyy', { locale: it }) : '—'}</span>
  //     ),
  //   },
  //   {
  //     key: '_count',
  //     header: 'Appuntamenti',
  //     render: (val) => (
  //       <div className="bg-surface-border/30 w-10 h-10 rounded-full flex items-center justify-center text-accent font-bold">
  //         {val?.bookings ?? 0}
  //       </div>
  //     ),
  //   },
  //   {
  //     key: 'id',
  //     header: '',
  //     render: (_, c) => (
  //       <div className="flex justify-end gap-2">
  //         <button className="p-2 hover:bg-white/10 rounded-lg text-white transition" title="Agenda">
  //           <Calendar size={18} />
  //         </button>
  //         <button onClick={() => openEdit(c)} className="p-2 hover:bg-white/10 rounded-lg text-accent transition" title="Modifica">
  //           <Edit size={18} />
  //         </button>
  //         <button onClick={() => handleDelete(c.id)} className="p-2 hover:bg-danger/20 rounded-lg text-danger transition" title="Elimina">
  //           <Trash2 size={18} />
  //         </button>
  //       </div>
  //     ),
  //   },
  // ];

  return (
    <div className="flex-1 flex flex-col gap-6">
      <PageHeader
        title="Anagrafica Clienti"
        subtitle="Gestisci i tuoi contatti e visualizza la loro storia"
        actions={
          <>
            <ExportButtons
              filenameBase="clienti"
              title="Anagrafica Clienti"
              rows={customers || []}
              columns={exportColumns}
              filtersLabel={`Ricerca: ${debouncedSearch || 'nessuna'} - Pagina: ${page}`}
              resolveRows={async () => {
                const response = await customerService.getAll(debouncedSearch, 1, 1000);
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
          </>
        }
      />

      {/* Search */}
      <div className="glass-panel p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
          <input
            type="text"
            placeholder="Cerca per nome, cognome o telefono..."
            className="w-full bg-white/5 border border-surface-border rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-accent transition-all"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="glass-panel h-full flex flex-col overflow-hidden">
          {error ? (
            <div className="p-6">
              <StatePanel
                variant="error"
                title="Impossibile caricare i clienti"
                description="Riprova tra qualche secondo o aggiorna la pagina."
              />
            </div>
          ) : null}
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-border text-text-secondary text-xs uppercase tracking-widest font-bold">
                  <th className="p-5">Nominativo</th>
                  <th className="p-5">Contatti</th>
                  <th className="p-5">Ultima Visita</th>
                  <th className="p-5">Appuntamenti</th>
                  <th className="p-5 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="border-b border-surface-border/50">
                      <td className="p-5"><Skeleton variant="text" className="w-32" /></td>
                      <td className="p-5"><Skeleton variant="text" className="w-48" /></td>
                      <td className="p-5"><Skeleton variant="text" className="w-24" /></td>
                      <td className="p-5"><Skeleton variant="circle" className="w-8 h-8" /></td>
                      <td className="p-5"><Skeleton variant="rect" className="w-8 ml-auto" /></td>
                    </tr>
                  ))
                ) : (
                  customers?.map((customer) => (
                    <tr key={customer.id} className="border-b border-surface-border/50 hover:bg-white/2 transition-colors group">
                      <td className="p-5">
                        <div className="flex flex-col">
                          <span className="text-white font-bold font-outfit">{customer.firstName} {customer.lastName}</span>
                          <span className="text-xs text-text-secondary italic">{customer.notes || 'Nessuna nota'}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm text-text-secondary">
                            <Phone size={14} className="text-accent" />
                            {customer.phone}
                          </div>
                          {customer.email && (
                            <div className="flex items-center gap-2 text-sm text-text-secondary">
                              <Mail size={14} className="text-accent" />
                              {customer.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="text-sm text-white">
                          {customer.createdAt ? format(new Date(customer.createdAt), 'dd MMM yyyy', { locale: it }) : '-'}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="bg-surface-border/30 w-10 h-10 rounded-full flex items-center justify-center text-accent font-bold">
                          {customer._count?.bookings || 0}
                        </div>
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setEditingCustomer(customer); setIsModalOpen(true); }}
                            className="p-2 hover:bg-white/10 rounded-lg text-white transition"
                            title="Dettagli"
                          >
                            <Eye size={18} />
                          </button>
                          {canSendMessages ? (
                            <Link
                              href={`/whatsapp?customerId=${customer.id}&customerName=${encodeURIComponent(`${customer.firstName} ${customer.lastName}`)}&customerPhone=${encodeURIComponent(customer.phone)}`}
                              className="p-2 hover:bg-white/10 rounded-lg text-emerald-300 transition"
                              title="Invia WhatsApp"
                            >
                              <MessageCircle size={18} />
                            </Link>
                          ) : null}
                          {canManage ? (
                            <>
                              <button
                                onClick={() => { setEditingCustomer(customer); setIsModalOpen(true); }}
                                className="p-2 hover:bg-white/10 rounded-lg text-accent transition"
                                title="Modifica"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(customer.id)}
                                className="p-2 hover:bg-danger/20 rounded-lg text-danger transition"
                                title="Elimina"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          ) : null}
                        </div>
                        <MoreHorizontal className="group-hover:hidden text-text-secondary ml-auto" />
                      </td>
                    </tr>
                  ))
                )}
                {!isLoading && (!customers || customers.length === 0) && (
                  <tr>
                    <td colSpan={5} className="p-8">
                      <StatePanel
                        variant="empty"
                        title="Nessun cliente trovato"
                        description={debouncedSearch ? 'Prova a cambiare ricerca o svuotare i filtri.' : 'Quando aggiungi il primo cliente lo vedrai qui.'}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-surface-border">
              <span className="text-sm text-text-secondary">
                Pagina {page} di {totalPages} ({result?.total ?? 0} clienti)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
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
