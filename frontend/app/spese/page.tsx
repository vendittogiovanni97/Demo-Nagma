"use client";

import useSWR from 'swr';
import { fetcher } from '@/utils/fetcher';
import DataTable from '@/components/DataTable';
import { useState } from 'react';
import TransactionModal from '@/components/TransactionModal';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function SpesePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [month, setMonth] = useState(() => format(new Date(), 'yyyy-MM'));

  const { data: transactions, isLoading, mutate } = useSWR(`/api/transactions?month=${month}`, fetcher);
  const { data: summary, mutate: mutateSummary } = useSWR(`/api/transactions/summary?month=${month}`, fetcher);

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminare questo record?')) return;
    try {
      await fetch(`http://localhost:3001/api/transactions/${id}`, { method: 'DELETE' });
      mutate();
      mutateSummary();
    } catch (e) {
      alert('Errore');
    }
  };

  const columns = [
    { key: 'date', header: 'Data', render: (val: any) => format(new Date(val), 'dd MMM yyyy', { locale: it }) },
    { key: 'description', header: 'Descrizione' },
    { key: 'category', header: 'Categoria' },
    { key: 'type', header: 'Tipo', render: (val: any) => (
      <span className={`px-3 py-1 rounded-[10px] text-xs font-bold uppercase ${val === 'INCOME' ? 'bg-[#00BFFF]/10 text-accent' : 'bg-[#ff5252]/10 text-danger'}`}>
        {val === 'INCOME' ? 'Entrata' : 'Spesa'}
      </span>
    ) },
    { key: 'amount', header: 'Importo', render: (val: any) => `€ ${val.toFixed(2)}` },
    { key: 'actions', header: '', render: (_: any, row: any) => (
      <button className="text-danger hover:text-red-400 transition-colors" onClick={() => handleDelete(row.id)}>
        <Trash2 size={18} />
      </button>
    ) }
  ];

  return (
    <div className="flex-1 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl tracking-tight text-white font-outfit font-semibold">Gestione Finanze</h1>
        <div className="flex gap-4">
          <input 
            type="month" 
            value={month}
            onChange={e => setMonth(e.target.value)}
            className="p-3 rounded-[10px] bg-white/5 border border-surface-border text-white focus:outline-none focus:border-accent transition appearance-none"
          />
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">Registra Movimento</button>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        <div className="glass-panel p-6 text-center">
          <div className="text-3xl font-bold text-accent font-outfit">€ {summary?.totalIncome?.toFixed(2) || '0.00'}</div>
          <div className="text-xs text-text-secondary uppercase tracking-widest mt-1">Totale Entrate</div>
        </div>
        <div className="glass-panel p-6 text-center">
          <div className="text-3xl font-bold text-danger font-outfit">€ {summary?.totalExpense?.toFixed(2) || '0.00'}</div>
          <div className="text-xs text-text-secondary uppercase tracking-widest mt-1">Totale Uscite</div>
        </div>
        <div className="glass-panel p-6 text-center">
          <div className="text-3xl font-bold text-white font-outfit">€ {summary?.balance?.toFixed(2) || '0.00'}</div>
          <div className="text-xs text-text-secondary uppercase tracking-widest mt-1">Saldo Netto</div>
        </div>
      </div>

      <div className="glass-panel flex-1 p-6 flex flex-col gap-4">
        <h2 className="text-xl font-outfit mb-2">Recenti transazioni</h2>
        <DataTable data={transactions} columns={columns} isLoading={isLoading} emptyMessage="Nessun record trovato in questo mese." />
      </div>

      <TransactionModal isOpen={isModalOpen} onClose={() => {
        setIsModalOpen(false);
        mutate();
        mutateSummary();
      }} />
    </div>
  );
}
