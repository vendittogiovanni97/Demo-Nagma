"use client";

import { useState } from 'react';
import { transactionService } from '@/services/transaction.service';
import DataTable from '@/components/data-display/DataTable';
import TransactionModal from '@/components/modals/TransactionModal';
import PageHeader from '@/components/layout/PageHeader';
import StatCard from '@/components/data-display/StatCard';
import ExportButtons from '@/components/feedback/ExportButtons';
import { Trash2, Plus, Calendar, Search } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import StatePanel from '@/components/feedback/StatePanel';
import type { Transaction } from '@/types/transaction';
import { useTransactions, useTransactionSummary } from '@/hooks/domain';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { canManageFinance } from '@/utils/permissions';
import { notifyError, notifySuccess } from '@/utils/toast';
import type { Column } from '@/components/data-display/DataTable';

export default function SpesePage() {
  const { isAuthenticated, user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [month, setMonth] = useState(() => format(new Date(), 'yyyy-MM'));
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 250);
  const canManage = canManageFinance(user?.role);

  const { data: transactionsResult, isLoading, mutate, error } = useTransactions({
    month,
    type: typeFilter === 'ALL' ? undefined : typeFilter,
    search: debouncedSearch,
    page,
  });
  const { data: summary, mutate: mutateSummary } = useTransactionSummary(month);
  const transactions = transactionsResult?.data || [];

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminare questo record?')) return;
    try {
      await transactionService.delete(id);
      notifySuccess('Record eliminato');
      mutate();
      mutateSummary();
    } catch (e: unknown) {
      notifyError(e, 'Errore');
    }
  };

  const columns: Column<Transaction>[] = [
    { key: 'date', header: 'Data', render: (val) => format(new Date(String(val)), 'dd MMM yyyy', { locale: it }) },
    { key: 'description', header: 'Descrizione' },
    { key: 'category', header: 'Categoria' },
    { key: 'type', header: 'Tipo', render: (val) => (
      <span className={`px-3 py-1 rounded-[10px] text-xs font-bold uppercase ${val === 'INCOME' ? 'bg-accent/10 text-accent' : 'bg-danger/10 text-danger'}`}>
        {val === 'INCOME' ? 'Entrata' : 'Uscita'}
      </span>
    ) },
    { key: 'amount', header: 'Importo', render: (val) => `€ ${Number(val).toFixed(2)}` },
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
            <ExportButtons
              filenameBase="finanze"
              title="Gestione Finanze"
              rows={transactions}
              columns={[
                {
                  label: 'Data',
                  value: (transaction: Transaction) =>
                    format(new Date(transaction.date), 'dd/MM/yyyy', { locale: it }),
                },
                { label: 'Descrizione', value: (transaction: Transaction) => transaction.description },
                { label: 'Categoria', value: (transaction: Transaction) => transaction.category },
                { label: 'Tipo', value: (transaction: Transaction) => transaction.type },
                { label: 'Importo', value: (transaction: Transaction) => transaction.amount.toFixed(2) },
              ]}
              filtersLabel={`Mese: ${month} - Ricerca: ${search || 'nessuna'} - Tipo: ${typeFilter}`}
              resolveRows={async () => {
                const response = await transactionService.getAll({
                  month,
                  type: typeFilter === 'ALL' ? undefined : typeFilter,
                  search: debouncedSearch,
                  page: 1,
                  limit: 1000,
                });
                return response.data;
              }}
            />
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" size={18} />
              <input
                type="month"
                value={month}
                onChange={e => {
                  setMonth(e.target.value);
                  setPage(1);
                }}
                className="p-3 pl-12 rounded-xl bg-white/5 border border-surface-border text-white focus:outline-none focus:border-accent transition appearance-none"
              />
            </div>
            {canManage ? (
              <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 px-6">
                <Plus size={20} />
                <span>Nuovo Movimento</span>
              </button>
            ) : null}
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
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-outfit">Transazioni del mese</h2>
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Cerca per descrizione o categoria..."
                className="w-full rounded-xl border border-surface-border bg-white/5 py-3 pl-11 pr-4 text-white outline-none transition focus:border-accent md:w-80"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as 'ALL' | 'INCOME' | 'EXPENSE');
                setPage(1);
              }}
              className="rounded-xl border border-surface-border bg-white/5 px-4 py-3 text-white outline-none transition focus:border-accent"
            >
              <option value="ALL">Tutti i tipi</option>
              <option value="INCOME">Entrate</option>
              <option value="EXPENSE">Uscite</option>
            </select>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          {error ? (
            <StatePanel
              variant="error"
              title="Impossibile caricare i movimenti"
              description="Riprova tra poco o aggiorna la pagina."
            />
          ) : (
            <DataTable
              data={transactions}
              columns={columns}
              isLoading={isLoading}
              emptyMessage="Nessun movimento trovato."
              pagination={{
                page: transactionsResult?.page ?? 1,
                totalPages: transactionsResult?.totalPages ?? 1,
                total: transactionsResult?.total ?? 0,
                onPrev: () => setPage((prev) => Math.max(1, prev - 1)),
                onNext: () => setPage((prev) => Math.min(transactionsResult?.totalPages ?? 1, prev + 1)),
              }}
            />
          )}
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
