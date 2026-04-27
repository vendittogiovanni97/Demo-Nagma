"use client";

import PageHeader from '@/components/layout/PageHeader';
import BookingModal from '@/components/modals/BookingModal';
import ExportModal from '@/components/modals/ExportModal';
import PasswordConfirmModal from '@/components/modals/PasswordConfirmModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/context/AuthContext';
import { useBookings } from '@/hooks/domain/useBookings';
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm';
import type { Booking } from '@/types/booking';
import { Box } from '@mui/material';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import BookingAttachmentsModal from './components/BookingAttachmentsModal';
import BookingDataTable from './components/BookingDataTable';
import BookingFilters from './components/BookingFilters';
import { useBookingActions } from './hooks/useBookingActions';
import { useBookingColumns } from './hooks/useBookingColumns';
import { useBookingFilters } from './hooks/useBookingFilters';

export default function PrenotazioniPage() {
  const { isSuperAdmin } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [attachmentsBooking, setAttachmentsBooking] = useState<Booking | null>(null);
  const { confirmDialogProps } = useDeleteConfirm();

  const {
    month,
    monthLabel,
    search,
    startDate,
    endDate,
    showCancelled,
    debouncedSearch,
    setSearch,
    setStartDate,
    setEndDate,
    setShowCancelled,
    resetDateRange,
    prevMonth,
    nextMonth,
    filterBookings,
  } = useBookingFilters();

  const { data: bookings, mutate, isLoading, error } = useBookings(month);

  const {
    showDeletePasswordModal,
    deletePasswordLoading,
    handleComplete,
    handleDelete,
    handlePasswordDelete,
    closePendingDelete,
  } = useBookingActions({ mutate });

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setIsModalOpen(true);
  };

  const handleAttachmentClick = (booking: Booking) => {
    setAttachmentsBooking(booking);
  };

  const { bookingColumns, exportColumns, exportFilters } = useBookingColumns({
    onAttachmentClick: handleAttachmentClick,
  });

  const filteredBookings = useMemo(
    () => filterBookings(bookings ?? []),
    [bookings, filterBookings],
  );

  const handleOpenNewModal = () => {
    setEditingBooking(null);
    setIsModalOpen(true);
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <PageHeader
        title="Prenotazioni"
        extraActions={
          <ExportModal
            filenameBase={`prenotazioni-${month}`}
            title={`Prenotazioni — ${monthLabel}`}
            rows={bookings || []}
            columns={exportColumns}
            filters={exportFilters}
            filtersLabel={`Mese: ${monthLabel}`}
            resolveRows={async () => bookings || []}
          />
        }
        showButton
        buttonLabel="Nuova Prenotazione"
        buttonIcon={<Plus size={18} />}
        buttonRequiresAdmin
        onButtonClick={handleOpenNewModal}
      />

      <BookingFilters
        monthLabel={monthLabel}
        search={search}
        startDate={startDate}
        endDate={endDate}
        showCancelled={showCancelled}
        onSearchChange={setSearch}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onShowCancelledChange={setShowCancelled}
        onResetDateRange={resetDateRange}
        onPrevMonth={prevMonth}
        onNextMonth={nextMonth}
      />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <BookingDataTable
          columns={bookingColumns}
          data={filteredBookings}
          isLoading={isLoading}
          hasError={!!error}
          debouncedSearch={debouncedSearch}
          onComplete={handleComplete}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Box>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => mutate()}
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
          onClose={closePendingDelete}
          onConfirm={handlePasswordDelete}
          loading={deletePasswordLoading}
        />
      )}
    </Box>
  );
}
