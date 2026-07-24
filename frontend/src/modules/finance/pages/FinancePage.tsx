"use client";

import {
  Box,
  Grid,
  Stack,
} from '@mui/material';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import Icon from '@/common/components/ui/Icon';

import PageHeader from '@/common/components/common/PageHeader';
import ExportModal from '@/common/components/modals/ExportModal';
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
  } = useFinance();

  const exportColumns = [
    { label: 'Data', value: (t: Transaction) => format(new Date(t.date), 'dd/MM/yyyy') },
    { label: 'Tipo', value: (t: Transaction) => t.type === 'ENTRATA' ? 'Entrata' : 'Uscita' },
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
                limit: 1000,
              });
              return res.data;
            }}
            getPdfSummary={(rows) => ({
              label: 'Totale netto',
              value: formatPrice(
                rows.reduce(
                  (total, transaction) =>
                    total + (transaction.type === 'ENTRATA' ? transaction.amount : -transaction.amount),
                  0,
                ),
              ),
            })}
          />
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
        />
      </Stack>
    </Box>
  );
}

