"use client";

import { Box } from '@mui/material';
import { addMonths, format, subMonths } from 'date-fns';
import { it } from 'date-fns/locale';
import PageContainer from '@/common/components/layout/PageContainer';
import PageHeader from '@/common/components/common/PageHeader';
import { formatPrice } from '@/common/shared/utils/format';
import { financeApi, Transaction } from '../api/finance.api';
import FinanceDataTable from '../components/FinanceDataTable';
import { useFinance } from '../hooks/useFinance';

export default function FinancePage() {
  const {
    transactions,
    isLoading,
    month,
    setMonth,
    search,
    setSearch,
    type,
    setType,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
  } = useFinance();

  const exportColumns = [
    { label: 'Data', value: (t: Transaction) => format(new Date(t.date), 'dd/MM/yyyy') },
    { label: 'Tipo', value: (t: Transaction) => (t.type === 'ENTRATA' ? 'Entrata' : 'Uscita') },
    { label: 'Categoria', value: (t: Transaction) => t.category },
    { label: 'Descrizione', value: (t: Transaction) => t.description },
    { label: 'Importo', value: (t: Transaction) => formatPrice(t.amount) },
  ];

  return (
    <PageContainer pt={1}>
      <PageHeader
        title="Storico Movimenti"
        subtitle="Cronologia completa di entrate e uscite dello studio"
        smartFilters={{
          search: {
            value: search,
            onChange: setSearch,
            placeholder: "Cerca per descrizione o categoria...",
          },
          monthPicker: {
            label: format(month, 'MMMM yyyy', { locale: it }),
            onPrev: () => setMonth(subMonths(month, 1)),
            onNext: () => setMonth(addMonths(month, 1)),
          },
          dateRange: {
            start: { value: startDate, onChange: setStartDate, label: 'Dal' },
            end: { value: endDate, onChange: setEndDate, label: 'Al' },
          },
          segmented: {
            value: type,
            onChange: (val) => setType(val as 'ALL' | 'ENTRATA' | 'USCITA'),
            options: [
              { label: 'Tutti', value: 'ALL' },
              { label: 'Entrate', value: 'ENTRATA' },
              { label: 'Uscite', value: 'USCITA' },
            ],
          },
        }}
        exportConfig={{
          filenameBase: `finanza_${format(month, 'yyyy_MM')}`,
          title: `Esportazione Finanziaria - ${format(month, 'MMMM yyyy', { locale: it })}`,
          rows: transactions,
          columns: exportColumns,
          resolveRows: async () => {
            const res = await financeApi.getAll({
              month: format(month, 'yyyy-MM'),
              type: type === 'ALL' ? undefined : type,
              search,
              startDate: startDate || undefined,
              endDate: endDate || undefined,
              limit: 1000,
            });
            return res.data;
          },
          getPdfSummary: (rows) => ({
            label: 'Totale netto',
            value: formatPrice(
              rows.reduce(
                (total, transaction) =>
                  total + (transaction.type === 'ENTRATA' ? transaction.amount : -transaction.amount),
                0,
              ),
            ),
          }),
        }}
      />

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <FinanceDataTable data={transactions} isLoading={isLoading} filterType={type} />
      </Box>
    </PageContainer>
  );
}
