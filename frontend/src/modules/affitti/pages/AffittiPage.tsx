"use client";

import { useMemo } from 'react';
import { Box, Typography, useTheme, alpha } from '@mui/material';
import { addMonths, format, subMonths } from 'date-fns';
import { it } from 'date-fns/locale';
import PageContainer from '@/common/components/layout/PageContainer';
import PageHeader from '@/common/components/common/PageHeader';
import DataTable, { ColumnDefinition as Column } from '@/common/components/table/DataTable';
import TableFooterTotal from '@/common/components/table/TableFooterTotal';
import Badge from '@/common/components/ui/Badge';
import Icon from '@/common/components/ui/Icon';
import { formatPrice } from '@/common/shared/utils/format';
import type { BookingDTO } from '@/modules/booking/api/booking.types';
import { bookingApi } from '@/modules/booking/api/booking.api';
import { useAffitti } from '../hooks/useAffitti';

export default function AffittiPage() {
  const theme = useTheme();
  const {
    bookings,
    isLoading,
    month,
    setMonth,
    search,
    setSearch,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    status,
    setStatus,
  } = useAffitti();

  const totalAmount = useMemo(() => {
    return bookings.reduce((acc, b) => acc + (b.price ? Number(b.price) : 0), 0);
  }, [bookings]);

  const totalCount = bookings.length;

  const label = useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const isTodayFilter = startDate === todayStr || endDate === todayStr;

    const base = isTodayFilter ? 'Totale Tatuaggi Affitti Oggi' : 'Totale Tatuaggi Affitti Postazione';
    return `${base} (${totalCount} sedut${totalCount === 1 ? 'a' : 'e'})`;
  }, [startDate, endDate, totalCount]);

  const columns: Column<BookingDTO>[] = [
    {
      key: 'id',
      label: 'ID',
      minWidth: 70,
      flex: 0.45,
      align: 'center',
      render: (b) => `#${b.id}`,
    },
    {
      key: 'date',
      label: 'Data e Ora',
      minWidth: 140,
      flex: 1,
      align: 'center',
      render: (b) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {format(new Date(b.date), 'dd MMM yyyy', { locale: it })}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}
          >
            <Icon name="clock" size={10} /> {format(new Date(b.date), 'HH:mm')}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'artist',
      label: 'Collaboratore',
      minWidth: 160,
      flex: 1.2,
      align: 'center',
      render: (b) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {b.artist?.name || 'Collaboratore in Affitto'}
          </Typography>
          <Badge variant="warning" size="xs">
            Affitto Postazione
          </Badge>
        </Box>
      ),
    },
    {
      key: 'customer',
      label: 'Cliente',
      minWidth: 160,
      flex: 1.2,
      align: 'center',
      render: (b) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {b.customer?.firstName} {b.customer?.lastName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {b.customer?.phone}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'status',
      label: 'Stato',
      minWidth: 120,
      flex: 0.9,
      align: 'center',
      render: (b) => {
        const isCompleted = b.status === 'COMPLETATO';
        const isCreated = b.status === 'CREATO' || b.status === 'CONFERMATO';
        return (
          <Badge
            label={b.status}
            size="sm"
            variant={isCompleted ? 'success' : isCreated ? 'info' : 'default'}
          />
        );
      },
    },
    {
      key: 'price',
      label: 'Prezzo Tatuaggio',
      minWidth: 130,
      flex: 1,
      align: 'center',
      render: (b) => (
        <Typography
          variant="body1"
          sx={{
            fontWeight: 800,
            color: theme.palette.primary.main,
          }}
        >
          {formatPrice(b.price ? Number(b.price) : 0)}
        </Typography>
      ),
    },
  ];

  const exportColumns = [
    { label: 'ID', value: (b: BookingDTO) => `#${b.id}` },
    { label: 'Data', value: (b: BookingDTO) => format(new Date(b.date), 'dd/MM/yyyy HH:mm') },
    { label: 'Collaboratore', value: (b: BookingDTO) => b.artist?.name || 'In Affitto' },
    { label: 'Cliente', value: (b: BookingDTO) => `${b.customer?.firstName} ${b.customer?.lastName}` },
    { label: 'Stato', value: (b: BookingDTO) => b.status },
    { label: 'Prezzo', value: (b: BookingDTO) => formatPrice(b.price ? Number(b.price) : 0) },
  ];

  const footer = !isLoading ? (
    <TableFooterTotal
      total={totalAmount}
      label={label}
      color="primary"
      privacyToggle
      defaultHidden
    />
  ) : null;

  return (
    <PageContainer pt={1}>
      <PageHeader
        title="Affitti Postazione"
        subtitle="Monitoraggio e conteggio delle sedute effettuate dai collaboratori in affitto"
        smartFilters={{
          search: {
            value: search,
            onChange: setSearch,
            placeholder: "Cerca per cliente, collaboratore o telefono...",
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
            value: status,
            onChange: setStatus,
            options: [
              { label: 'Tutti', value: 'ALL' },
              { label: 'Completati', value: 'COMPLETATO' },
              { label: 'In Programma', value: 'CREATO' },
            ],
          },
        }}
        exportConfig={{
          filenameBase: `affitti_${format(month, 'yyyy_MM')}`,
          title: `Report Affitti Postazione - ${format(month, 'MMMM yyyy', { locale: it })}`,
          rows: bookings,
          columns: exportColumns,
          resolveRows: async () => {
            const res = await bookingApi.getAll({
              month: format(month, 'yyyy-MM'),
              search,
              startDate: startDate || undefined,
              endDate: endDate || undefined,
              status: status === 'ALL' ? undefined : status,
              isRentPayee: true,
              limit: 1000,
            });
            return res.data;
          },
          getPdfSummary: (rows) => ({
            label: 'Totale Tatuaggi in Affitto',
            value: formatPrice(
              rows.reduce((total, b) => total + (b.price ? Number(b.price) : 0), 0)
            ),
          }),
        }}
      />

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DataTable
          columns={columns}
          baseColumns={[]}
          data={bookings}
          isLoading={isLoading}
          hideToolbar
          footerContent={footer}
          keyExtractor={(b) => b.id}
          emptyTitle="Nessun tatuaggio trovato per i collaboratori in affitto"
          emptyDescription="Prova a cambiare i filtri o il mese selezionato."
        />
      </Box>
    </PageContainer>
  );
}
