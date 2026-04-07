"use client";

import { useState } from 'react';
import useSWR from 'swr';
import { customerService } from '@/services/customer.service';
import { Search, UserPlus, Phone, Mail, Edit, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Customer } from '@/types/customer';
import DataTable, { Column } from '@/components/DataTable';
import CustomerModal from '@/components/CustomerModal';
import toast from 'react-hot-toast';

const LIMIT = 20;

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const { data, mutate, isLoading } = useSWR(
    ['/api/customers', search, page],
    () => customerService.getAll(search, page, LIMIT)
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo cliente?')) return;
    try {
      await customerService.delete(id);
      toast.success('Cliente eliminato');
      mutate();
    } catch (err: any) {
      toast.error(err.message || 'Errore durante l\'eliminazione');
    }
  };

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const openNew = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const columns: Column<Customer>[] = [
    {
      key: 'firstName',
      header: 'Nominativo',
      render: (_, c) => (
        <div className="flex flex-col">
          <span className="font-bold font-outfit">{c.firstName} {c.lastName}</span>
          <span className="text-xs text-text-secondary italic">{c.notes || 'Nessuna nota'}</span>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Contatti',
      render: (_, c) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-text-secondary">
            <Phone size={14} className="text-accent" /> {c.phone}
          </div>
          {c.email && (
            <div className="flex items-center gap-2 text-text-secondary">
              <Mail size={14} className="text-accent" /> {c.email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Prima visita',
      render: (val) => (
        <span>{val ? format(new Date(val), 'dd MMM yyyy', { locale: it }) : '—'}</span>
      ),
    },
    {
      key: '_count',
      header: 'Appuntamenti',
      render: (val) => (
        <div className="bg-surface-border/30 w-10 h-10 rounded-full flex items-center justify-center text-accent font-bold">
          {val?.bookings ?? 0}
        </div>
      ),
    },
    {
      key: 'id',
      header: '',
      render: (_, c) => (
        <div className="flex justify-end gap-2">
          <button className="p-2 hover:bg-white/10 rounded-lg text-white transition" title="Agenda">
            <Calendar size={18} />
          </button>
          <button onClick={() => openEdit(c)} className="p-2 hover:bg-white/10 rounded-lg text-accent transition" title="Modifica">
            <Edit size={18} />
          </button>
          <button onClick={() => handleDelete(c.id)} className="p-2 hover:bg-danger/20 rounded-lg text-danger transition" title="Elimina">
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-surface p-6 rounded-[25px] border border-surface-border shadow-xl">
        <div>
          <h1 className="text-3xl font-outfit font-bold text-white">Anagrafica Clienti</h1>
          <p className="text-text-secondary text-sm">Gestisci i tuoi contatti e visualizza la loro storia</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2 px-6">
          <UserPlus size={20} />
          <span>Nuovo Cliente</span>
        </button>
      </div>

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

      {/* Table */}
      <div className="glass-panel p-6 flex flex-col gap-4">
        <DataTable
          data={data?.data ?? []}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="Nessun cliente trovato"
          pagination={data ? {
            page: data.page,
            totalPages: data.totalPages,
            total: data.total,
            onPrev: () => setPage(p => p - 1),
            onNext: () => setPage(p => p + 1),
          } : undefined}
        />
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
