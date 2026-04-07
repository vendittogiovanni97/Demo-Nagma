"use client";

import { useState } from 'react';
import useSWR from 'swr';
import { transactionService } from '@/services/transaction.service';
import { ENDPOINTS } from '@/api/endpoints';
import DataTable from '@/components/DataTable';
import TransactionModal from '@/components/TransactionModal';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import { Trash2, Plus, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import type { FinanceSummary, Transaction } from '@/types';
import toast from 'react-hot-toast';

export default function SpesePage() {
  const { isAuthenticated } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [month, setMonth] = useState(() => format(new Date(), 'yyyy-MM'));

  const { data: transactions, isLoading, mutate } = useSWR<Transaction[]>(
    [ENDPOINTS.TRANSACTIONS.BASE, month],
    () => transactionService.getAll(undefined, month)
  );

  const { data: summary, mutate: mutateSummary } = useSWR<FinanceSummary>(
    [ENDPOINTS.TRANSACTIONS.SUMMARY, month],
    () => transactionService.getSummary(month)
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminare questo record?')) return;
    try {
      await transactionService.delete(id);
      toast.success('Record eliminato');
      mutate();
      mutateSummary();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Errore';
      toast.error(message);
    }
  };

  const columns = [
    { key: 'date', header: 'Data', render: (val: string) => format(new Date(val), 'dd MMM yyyy', { locale: it }) },
    { key: 'description', header: 'Descrizione' },
    { key: 'category', header: 'Categoria' },
    { key: 'type', header: 'Tipo', render: (val: string) => (
      <span className={`px-3 py-1 rounded-[10px] text-xs font-bold uppercase ${val === 'INCOME' ? 'bg-accent/10 text-accent' : 'bg-danger/10 text-danger'}`}>
        {val === 'INCOME' ? 'Entrata' : 'Uscita'}
      </span>
    ) },
    { key: 'amount', header: 'Importo', render: (val: number) => `€ ${val.toFixed(2)}` },
    { key: 'actions', header: '', render: (_: unknown, row: Transaction) => (
      <button className="text-danger hover:scale-110 transition-transform" onClick={() => handleDelete(row.id)}>
        <Trash2 size={18} />
      </button>
    ) }
  ];

  if (!isAuthenticated) return null;

  return (
    <div className="flex-1 flex flex-col gap-6">
      <PageHeader
        title="Gestione Finanze"
        subtitle="Visualizza entrate e uscite dello studio"
        actions={
          <>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" size={18} />
              <input
                type="month"
                value={month}
                onChange={e => setMonth(e.target.value)}
                className="p-3 pl-12 rounded-xl bg-white/5 border border-surface-border text-white focus:outline-none focus:border-accent transition appearance-none"
              />
            </div>
            <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 px-6">
              <Plus size={20} />
              <span>Nuovo Movimento</span>
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          value={`€ ${summary?.totalIncome?.toFixed(2) || '0.00'}`}
          label="Totale Entrate"
          color="text-accent"
        />
        <StatCard
          value={`€ ${summary?.totalExpense?.toFixed(2) || '0.00'}`}
          label="Totale Uscite"
          color="text-danger"
        />
        <StatCard
          value={`€ ${((summary?.totalIncome || 0) - (summary?.totalExpense || 0)).toFixed(2)}`}
          label="Saldo Netto"
          className="border-accent/20"
        />
      </div>

      <div className="glass-panel flex-1 p-6 flex flex-col gap-4">
        <h2 className="text-xl font-outfit mb-2">Transazioni del mese</h2>
        <div className="flex-1 overflow-hidden">
          <DataTable data={transactions || []} columns={columns} isLoading={isLoading} emptyMessage="Nessun movimento trovato." />
        </div>
      </div>

      <TransactionModal isOpen={isModalOpen} onClose={() => {
        setIsModalOpen(false);
        mutate();
        mutateSummary();
      }} />
    </div>
  );
}
