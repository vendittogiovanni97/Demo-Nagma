"use client";

import Button from '@/common/components/ui/Button';
import {
  Box,
  Grid,
  Stack,
} from '@mui/material';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import Icon from '@/common/components/ui/Icon';
import { useState } from 'react';

import PageHeader from '@/common/components/common/PageHeader';
import ExportModal from '@/common/components/modals/ExportModal';
import ConfirmDialog from '@/common/components/ui/ConfirmDialog';
import { useDeleteConfirm } from '@/common/hooks/useDeleteConfirm';
import TransactionModal from '@/modules/spese/components/modals/TransactionModal';
import { formatPrice } from '@/common/shared/utils/format';
import { financeApi, Transaction } from '../api/finance.api';
import FinanceDataTable from '../components/FinanceDataTable';
import FinanceFilters from '../components/FinanceFilters';
import { useFinance } from '../hooks/useFinance';


import SummaryCard from '../components/SummaryCard';

export default function FinancePage() {
  const {
    transactions,
    summary,
    isLoading,
    month,
    setMonth,
    search,
    setSearch,
    type,
    setType,
    refresh
  } = useFinance();

  const { deleteItem, confirmDialogProps } = useDeleteConfirm();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const handleDelete = async (id: number) => {
    await deleteItem({
      confirmMessage: 'Sei sicuro di voler eliminare questa transazione? L\'operazione verrà registrata nell\'audit log.',
      action: async () => {
        await financeApi.delete(id);
        refresh();
      },
      successMessage: 'Transazione eliminata correttamente',
    });
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };


  const exportColumns = [
    { label: 'Data', value: (t: Transaction) => format(new Date(t.date), 'dd/MM/yyyy') },
    { label: 'Tipo', value: (t: Transaction) => t.type === 'INCOME' ? 'Entrata' : 'Uscita' },
    { label: 'Categoria', value: (t: Transaction) => t.category },
    { label: 'Descrizione', value: (t: Transaction) => t.description },
    { label: 'Importo', value: (t: Transaction) => formatPrice(t.amount) },
  ];

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, pt: 1, pb: 4 }}>
      <PageHeader
        title="Storico Movimenti"
        subtitle="Cronologia completa di entrate e uscite dello studio"
            icon={<Icon name="dollarSign" size={24} />}
        actions={
          <Stack sx={{ flexDirection: 'row', gap: 2 }} component="div">
            <ExportModal
              filenameBase={`finanza_${format(month, 'yyyy_MM')}`}
              title={`Esportazione Finanziaria - ${format(month, 'MMMM yyyy', { locale: it })}`}
              rows={transactions}
              columns={exportColumns}
              resolveRows={async () => {
                const res = await financeApi.getAll({
                  month: format(month, 'yyyy-MM'),
                  type: type === 'ALL' ? undefined : type,
                  search,
                  limit: 1000 // Prendi tutto per l'export
                });
                return res.data;
              }}
            />
            <Button
              variant="primary"
              icon={<Icon name="plus" size={18} />}
              onClick={() => {
                setSelectedTransaction(null);
                setIsModalOpen(true);
              }}
            >
              Nuovo Movimento
            </Button>
          </Stack>
        }
      />

      <Grid container spacing={3} sx={{ mb: 1, mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <SummaryCard
            title="Entrate Totali"
            amount={summary?.totalIncome ?? 0}
            icon={<Icon name="trendingUp" size={24} />}
            color="primary.main"
            isLoading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SummaryCard
            title="Uscite Totali"
            amount={summary?.totalExpense ?? 0}
            icon={<Icon name="trendingDown" size={24} />}
            color="error.main"
            isLoading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SummaryCard
            title="Bilancio Netto"
            amount={summary?.balance ?? 0}
        icon={<Icon name="dollarSign" size={24} />}
            color={ (summary?.balance ?? 0) >= 0 ? 'success.main' : 'warning.main' }
            isLoading={isLoading}
          />
        </Grid>
      </Grid>

      <Stack sx={{ gap: 3 }}>
        <FinanceFilters
          month={month}
          onMonthChange={setMonth}
          search={search}
          onSearchChange={setSearch}
          type={type}
          onTypeChange={setType}
        />
        <FinanceDataTable
          data={transactions}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Stack>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refresh}
        transaction={selectedTransaction}
      />

      <ConfirmDialog {...confirmDialogProps} />
    </Box>
  );
}




