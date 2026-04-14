"use client";

import type { Column } from '@/components/data-display/DataTable';
import DataTable from '@/components/data-display/DataTable';
import StatCard from '@/components/data-display/StatCard';
import StatePanel from '@/components/feedback/StatePanel';
import SearchInput from '@/components/forms/SearchInput';
import PageHeader from '@/components/layout/PageHeader';
import type { ExportFilter } from '@/components/modals/ExportModal';
import ExportModal from '@/components/modals/ExportModal';
import TransactionModal from '@/components/modals/TransactionModal';
import { DEBOUNCE_SEARCH_DELAY, EXPORT_FETCH_LIMIT } from '@/config/defaults';
import { useAuth } from '@/context/AuthContext';
import { useTransactions, useTransactionSummary } from '@/hooks/domain';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { transactionService } from '@/services/transaction.service';
import type { Transaction } from '@/types/transaction';
import { canManageFinance } from '@/utils/permissions';
import { notifyError, notifySuccess } from '@/utils/toast';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function SpesePage() {
  const { isAuthenticated, user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [month, setMonth] = useState(() => format(new Date(), 'yyyy-MM'));
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, DEBOUNCE_SEARCH_DELAY);
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
        actions={
          <>
            <ExportModal
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
              filters={[
                {
                  key: 'month',
                  label: 'Mese',
                  type: 'month',
                  value: month,
                  onChange: (v) => { setMonth(v); setPage(1); },
                },
                {
                  key: 'type',
                  label: 'Tipo',
                  type: 'select',
                  value: typeFilter,
                  options: [
                    { label: 'Tutti i tipi', value: 'ALL' },
                    { label: 'Entrate', value: 'INCOME' },
                    { label: 'Uscite', value: 'EXPENSE' },
                  ],
                  onChange: (v) => { setTypeFilter(v as 'ALL' | 'INCOME' | 'EXPENSE'); setPage(1); },
                },
              ] satisfies ExportFilter[]}
              filtersLabel={`Mese: ${month} - Tipo: ${typeFilter}`}
              resolveRows={async () => {
                const response = await transactionService.getAll({
                  month,
                  type: typeFilter === 'ALL' ? undefined : typeFilter,
                  search: debouncedSearch,
                  page: 1,
                  limit: EXPORT_FETCH_LIMIT,
                });
                return response.data;
              }}
            />
            {canManage ? (
              <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 px-6">
                <Plus size={20} />
                <span>Nuovo Movimento</span>
              </button>
            ) : null}
          </>
        }
      >
        <div className="flex-1 max-w-2xl mx-auto flex gap-3">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Cerca per descrizione o categoria..."
          />
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as 'ALL' | 'INCOME' | 'EXPENSE');
              setPage(1);
            }}
            className="rounded-xl border border-surface-border bg-white/5 px-4 py-3 text-white outline-none transition focus:border-accent whitespace-nowrap"
          >
            <option value="ALL">Tutti i tipi</option>
            <option value="INCOME">Entrate</option>
            <option value="EXPENSE">Uscite</option>
          </select>
        </div>
      </PageHeader>

      {/* Stats */}
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

      {/* Table */}
      <div className="glass-panel flex-1 p-6 rounded-2xl">
        {error ? (
          <StatePanel
            variant="error"
            fullPage
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

      <TransactionModal isOpen={isModalOpen} onClose={() => {
        setIsModalOpen(false);
        mutate();
        mutateSummary();
      }} />
    </div>
  );
}
