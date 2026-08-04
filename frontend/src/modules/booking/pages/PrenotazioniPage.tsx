"use client";

import PageHeader from '@/common/components/common/PageHeader';
import BookingModal from '../components/modals/BookingModal';
import PasswordConfirmModal from '@/common/components/modals/PasswordConfirmModal';
import CheckboxInput from '@/common/components/forms/CheckboxInput';
import ConfirmDialog from '@/common/components/ui/ConfirmDialog';
import { useAuth } from '@/common/context/AuthContext';
import { useBookings } from '../hooks/useBooking';
import { bookingApi } from '../api/booking.api';
import { bookingMapper } from '../api/booking.mapper';
import { useDeleteConfirm } from '@/common/hooks/useDeleteConfirm';
import type { Booking } from '@/modules/booking/model/booking.types';
import { Box } from '@mui/material';
import Icon from '@/common/components/ui/Icon';
import { useState, Suspense, useCallback } from 'react';
import BookingAttachmentsModal from '../components/modals/BookingAttachmentsModal';
import BookingDataTable from '../components/BookingDataTable';
import BookingFilters from '../components/BookingFilters';
import { useBookingActions } from '../hooks/useBookingActions';
import { useBookingColumns } from '../hooks/useBookingColumns';
import { useBookingFilters } from '../hooks/useBookingFilters';

function PrenotazioniPageContent() {
  const { isSuperAdmin } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [attachmentsBooking, setAttachmentsBooking] = useState<Booking | null>(null);
  const [refundOnDelete, setRefundOnDelete] = useState(false);
  const { confirmDialogProps } = useDeleteConfirm();

  const {
    month,
    monthLabel,
    search,
    startDate,
    endDate,
    statusFilter,
    sortOrder,
    debouncedSearch,
    setSearch,
    setStartDate,
    setEndDate,
    setStatusFilter,
    setSortOrder,
    resetDateRange,
    setToday,
    prevMonth,
    nextMonth,
  } = useBookingFilters();

  const { data: bookingsResult, mutate, updateBookingLocalState, isLoading, error } = useBookings({
    month,
    search: debouncedSearch || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    status: statusFilter,
    sortOrder,
  });
  const bookings = (bookingsResult?.data ?? []) as unknown as Booking[];

  const {
    showDeletePasswordModal,
    showDeleteConfirm,
    deletePasswordLoading,
    handleComplete,
    handleRestore,
    handleDelete,
    handlePasswordDelete,
    confirmSuperAdminDelete,
    closeDeleteConfirm,
    closePendingDelete,
  } = useBookingActions({ mutate, onUpdateLocalState: updateBookingLocalState });

  const handleEdit = useCallback((booking: Booking) => {
    setEditingBooking(booking);
    setIsModalOpen(true);
  }, []);

  const handleAttachmentClick = useCallback((booking: Booking) => {
    setAttachmentsBooking(booking);
  }, []);

  const { bookingColumns, exportColumns, exportFilters } = useBookingColumns({
    onAttachmentClick: handleAttachmentClick,
  });

  const handleOpenNewModal = useCallback(() => {
    setEditingBooking(null);
    setIsModalOpen(true);
  }, []);

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
      <PageHeader
        title="Prenotazioni"
        exportConfig={{
          filenameBase: `prenotazioni-${month}`,
          title: "Prenotazioni",
          rows: bookings || [],
          columns: exportColumns,
          filters: exportFilters,
          filtersLabel: `Mese: ${monthLabel}`,
          resolveRows: async () => {
            const res = await bookingApi.getAll({ month });
            return res.data.map(bookingMapper.toModel) as unknown as Booking[];
          },
        }}
        showButton
        buttonLabel="Nuova Prenotazione"
        buttonIcon={<Icon name="plus" size={18} />}
        buttonRequiresAdmin
        onButtonClick={handleOpenNewModal}
        filters={
          <BookingFilters
            monthLabel={monthLabel}
            search={search}
            startDate={startDate}
            endDate={endDate}
            statusFilter={statusFilter}
            sortOrder={sortOrder}
            onSearchChange={setSearch}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onStatusFilterChange={setStatusFilter}
            onSortOrderChange={setSortOrder}
            onResetDateRange={resetDateRange}
            onTodayClick={setToday}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
          />
        }
      />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', pt: 2 }}>
        <BookingDataTable
          columns={bookingColumns}
          data={bookings}
          isLoading={isLoading}
          onComplete={handleComplete}
          onRestore={handleRestore}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Box>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => mutate()}
        onUpdateLocalState={updateBookingLocalState}
        booking={editingBooking}
      />
      <BookingAttachmentsModal
        booking={attachmentsBooking}
        isOpen={attachmentsBooking !== null}
        onClose={() => setAttachmentsBooking(null)}
        onMutate={mutate}
      />
      <ConfirmDialog {...confirmDialogProps} />

      {!isSuperAdmin && (
        <PasswordConfirmModal
          isOpen={showDeletePasswordModal}
          onClose={() => { closePendingDelete(); setRefundOnDelete(false); }}
          onConfirm={(pwd) => handlePasswordDelete(pwd, refundOnDelete)}
          loading={deletePasswordLoading}
          title="Conferma Cancellazione"
          description="Inserisci la password per confermare la cancellazione della prenotazione."
          extra={
            <CheckboxInput
              label="Rimborsa l'acconto al cliente"
              checked={refundOnDelete}
              onChange={setRefundOnDelete}
              sx={{ mb: 1 }}
            />
          }
        />
      )}

      {isSuperAdmin && (
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => { closeDeleteConfirm(); setRefundOnDelete(false); }}
          onConfirm={() => { confirmSuperAdminDelete(refundOnDelete); setRefundOnDelete(false); }}
          title="Conferma Cancellazione"
          message="Vuoi cancellare questa prenotazione?"
          confirmText="Cancella"
          severity="error"
        >
          <CheckboxInput
            label="Rimborsa l'acconto al cliente"
            checked={refundOnDelete}
            onChange={setRefundOnDelete}
          />
        </ConfirmDialog>
      )}
    </Box>
  );
}

export default function PrenotazioniPage() {
  return (
    <Suspense fallback={null}>
      <PrenotazioniPageContent />
    </Suspense>
  );
}
