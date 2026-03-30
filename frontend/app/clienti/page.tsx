"use client";

import useSWR from 'swr';
import { fetcher } from '@/utils/fetcher';
import DataTable from '@/components/DataTable';
import { Eye, MessageCircle, Pen, Trash2 } from 'lucide-react';
import { useState } from 'react';
import CustomerModal from '@/components/CustomerModal';

export default function ClientiPage() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Use debounced search in production, using simple trigger here
  const { data: clienti, error, isLoading, mutate } = useSWR(`/api/customers?search=${search}`, fetcher);

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo cliente?')) return;
    try {
      await fetch(`http://localhost:3001/api/customers/${id}`, { method: 'DELETE' });
      mutate(); // ricarica tabella
    } catch (e) {
      alert('Errore eliminazione');
    }
  };

  const openWhatsApp = (phone: string, firstName: string) => {
    const waUrl = `https://wa.me/39${phone.replace(/\D/g, '')}?text=Ciao%20${encodeURIComponent(firstName)},`;
    window.open(waUrl, '_blank');
  };

  const columns = [
    { key: 'firstName', header: 'Nome', render: (val: any, row: any) => <span className="font-bold">{val} {row.lastName}</span> },
    { key: 'phone', header: 'Telefono' },
    { key: 'email', header: 'Email', render: (val: any) => val || '-' },
    { key: '_count', header: 'N° App.', render: (val: any) => val?.bookings || 0 },
    { key: 'actions', header: 'Azioni', render: (_: any, row: any) => (
      <div className="flex items-center gap-3">
        <button className="text-success hover:scale-110 transition-transform" onClick={() => openWhatsApp(row.phone, row.firstName)}>
          <MessageCircle size={18} />
        </button>
        <button className="text-text-secondary hover:text-white transition-colors">
          <Eye size={18} />
        </button>
        <button className="text-accent hover:text-accent-hover transition-colors">
          <Pen size={18} />
        </button>
        <button className="text-danger hover:text-red-400 transition-colors" onClick={() => handleDelete(row.id)}>
          <Trash2 size={18} />
        </button>
      </div>
    )}
  ];

  return (
    <div className="flex-1 flex flex-col gap-6">
      <h1 className="text-3xl tracking-tight text-white font-outfit font-semibold">Gestione Clienti</h1>
      <div className="glass-panel flex-1 p-6 flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <input 
            type="text" 
            placeholder="Cerca cliente (nome/tel)..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[300px] p-3 rounded-[10px] bg-white/5 border border-surface-border text-white outline-none focus:border-accent transition-colors"
          />
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">Nuovo Cliente</button>
        </div>
        
        {error && <div className="text-danger">Errore caricamento dati: {error.message}</div>}
        
        <DataTable data={clienti} columns={columns} isLoading={isLoading} emptyMessage="Nessun cliente nel database" />
      </div>

      <CustomerModal isOpen={isModalOpen} onClose={() => {
        setIsModalOpen(false);
        mutate();
      }} />
    </div>
  );
}
