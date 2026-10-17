"use client";

import { Box } from '@mui/material';
import { addMonths, endOfYear, format, startOfYear, subMonths } from 'date-fns';
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
    { label: 'Tipo', width: 60, value: (t: Transaction) => (t.type === 'ENTRATA' ? 'Entrata' : 'Uscita') },
    { label: 'Categoria', width: 85, value: (t: Transaction) => t.category },
    { label: 'Artista', value: (t: Transaction) => t.artistName ?? '' },
    { label: 'Descrizione', value: (t: Transaction) => t.description },
    {
      label: 'Importo',
      // La % studio riguarda il saldo della prenotazione, non l'acconto.
      value: (t: Transaction) => (t.sourceType === 'BOOKING' && t.studioPercentage != null
        ? `${formatPrice(t.amount)} (${t.studioPercentage}%)`
        : formatPrice(t.amount)),
    },
    { label: 'Note', width: 170, value: (t: Transaction) => t.bookingNotes ?? '' },
  ];

  const exportFilters = [
    {
      key: 'mese',
      label: 'Mese',
      type: 'month' as const,
      defaultValue: format(month, 'yyyy-MM'),
      filterFn: (t: Transaction, v: string) => !v || format(new Date(t.date), 'yyyy-MM') === v,
    },
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
          // Titolo e nome file seguono il mese scelto nel filtro Mese del modale.
          getExportNaming: (values) => {
            if (!values.mese) {
              return {
                title: `Esportazione Finanziaria - ${format(month, 'yyyy', { locale: it })}`,
                filenameBase: `finanza_${format(month, 'yyyy')}`,
              };
            }
            const chosen = new Date(`${values.mese}-01T00:00:00`);
            return {
              title: `Esportazione Finanziaria - ${format(chosen, 'MMMM yyyy', { locale: it })}`,
              filenameBase: `finanza_${format(chosen, 'yyyy_MM')}`,
            };
          },
          rows: transactions,
          columns: exportColumns,
          filters: exportFilters,
          resolveRows: async () => {
            // Si scarica l'intero anno: il filtro Mese del modale sceglie il mese da esportare.
            const res = await financeApi.getAll({
              type: type === 'ALL' ? undefined : type,
              search,
              startDate: startDate || format(startOfYear(month), 'yyyy-MM-dd'),
              endDate: endDate || format(endOfYear(month), 'yyyy-MM-dd'),
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
        <FinanceDataTable
          data={transactions}
          isLoading={isLoading}
          filterType={type}
          startDate={startDate}
          endDate={endDate}
        />
      </Box>
    </PageContainer>
  );
}
