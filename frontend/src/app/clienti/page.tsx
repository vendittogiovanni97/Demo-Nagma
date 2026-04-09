"use client";

import { useState } from 'react';
import useSWR from 'swr';
import { customerService } from '@/services/customer.service';
import { ENDPOINTS } from '@/api/endpoints';
import { Search, UserPlus, Phone, Mail, MoreHorizontal, Calendar, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Skeleton } from '@/components/feedback/Skeleton';
import type { Customer } from '@/types';
import PageHeader from '@/components/layout/PageHeader';
import CustomerModal from '@/components/modals/CustomerModal';
import toast from 'react-hot-toast';

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const { data: customers, mutate, isLoading } = useSWR<Customer[]>(
    [ENDPOINTS.CUSTOMERS.BASE, search],
    () => customerService.getAll(search)
  );

  const handleDelete = async (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questo cliente?')) {
      try {
        await customerService.delete(id);
        toast.success('Cliente eliminato');
        mutate();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Errore durante l\'eliminazione';
        toast.error(message);
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
          <button
            onClick={() => { setEditingCustomer(null); setIsModalOpen(true); }}
            className="btn-primary flex items-center gap-2 px-6"
          >
            <UserPlus size={20} />
            <span>Nuovo Cliente</span>
          </button>
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
                    <tr key={customer.id} className="border-b border-surface-border/50 hover:bg-white/[0.02] transition-colors group">
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
                          <button className="p-2 hover:bg-white/10 rounded-lg text-white transition" title="Dettagli">
                            <Calendar size={18} />
                          </button>
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
                        </div>
                        <MoreHorizontal className="group-hover:hidden text-text-secondary ml-auto" />
                      </td>
                    </tr>
                  ))
                )}
                {!isLoading && (!customers || customers.length === 0) && (
                  <tr>
                    <td colSpan={5} className="p-20 text-center text-text-secondary italic">
                      Nessun cliente trovato
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
