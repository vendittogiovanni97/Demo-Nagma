"use client";

import PageHeader from '@/components/common/PageHeader';
import BookingModal from '../components/modals/BookingModal';
import ExportModal from '@/components/modals/ExportModal';
import PasswordConfirmModal from '@/components/modals/PasswordConfirmModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/context/AuthContext';
import { useBookings } from '../hooks/useBooking';
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm';
import type { Booking } from '@/modules/booking/model/booking.types';
import { Box } from '@mui/material';
import { Plus } from 'lucide-react';
import { useMemo, useState, Suspense, useCallback } from 'react';
import BookingAttachmentsModal from '../components/modals/BookingAttachmentsModal';
import BookingDataTable from '../components/BookingDataTable';
import BookingFilters from '../components/BookingFilters';
import { useBookingActions } from '../hooks/useBookingActions';
import { useBookingColumns } from '../hooks/useBookingColumns';
import { useBookingFilters } from '../hooks/useBookingFilters';

// Consensus Integration
import { useConsentConfig } from '@/modules/newfeature/consenso/hooks/useConsentConfig';
import ConsentModal from '@/modules/newfeature/consenso/components/ConsentModal';

function PrenotazioniPageContent() {
  const { isSuperAdmin } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [attachmentsBooking, setAttachmentsBooking] = useState<Booking | null>(null);
  const [consentBooking, setConsentBooking] = useState<Booking | null>(null);
  const { confirmDialogProps } = useDeleteConfirm();
  const { SHOW_CONSENSI } = useConsentConfig();

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
    prevMonth,
    nextMonth,
    filterBookings,
  } = useBookingFilters();

  const { data: bookingsResult, mutate, isLoading, error } = useBookings({ month });
  const bookings = (bookingsResult?.data ?? []) as unknown as Booking[];

  const {
    showDeletePasswordModal,
    deletePasswordLoading,
    handleComplete,
    handleRestore,
    handleDelete,
    handlePasswordDelete,
    closePendingDelete,
  } = useBookingActions({ mutate });

  const handleEdit = useCallback((booking: Booking) => {
    setEditingBooking(booking);
    setIsModalOpen(true);
  }, []);

  const handleAttachmentClick = useCallback((booking: Booking) => {
    setAttachmentsBooking(booking);
  }, []);

  const { bookingColumns, exportColumns, exportFilters } = useBookingColumns({
    onAttachmentClick: handleAttachmentClick,
    onConsentClick: setConsentBooking,
  });

  const filteredBookings = useMemo(
    () => filterBookings(bookings ?? []),
    [bookings, filterBookings],
  );

  const handleOpenNewModal = useCallback(() => {
    setEditingBooking(null);
    setIsModalOpen(true);
  }, []);

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
      <PageHeader
        title="Prenotazioni"
        actions={
          <ExportModal
            filenameBase={`prenotazioni-${month}`}
            title={`Prenotazioni — ${monthLabel}`}
            rows={bookings || []}
            columns={exportColumns}
            filters={exportFilters}
            filtersLabel={`Mese: ${monthLabel}`}
            resolveRows={async () => bookings}
          />
        }
        showButton
        buttonLabel="Nuova Prenotazione"
        buttonIcon={<Plus size={18} />}
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
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
          />
        }
      />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', pt: 2 }}>
        <BookingDataTable
          columns={bookingColumns}
          data={filteredBookings}
          isLoading={isLoading}
          hasError={!!error}
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
        booking={editingBooking}
      />
      <BookingAttachmentsModal
        booking={attachmentsBooking}
        isOpen={attachmentsBooking !== null}
        onClose={() => setAttachmentsBooking(null)}
        onMutate={mutate}
      />
      <ConfirmDialog {...confirmDialogProps} />

      {/* Consent Details Modal Trigger */}
      {SHOW_CONSENSI && isSuperAdmin && (
        <ConsentModal
          open={consentBooking !== null}
          onClose={() => setConsentBooking(null)}
          booking={consentBooking}
        />
      )}
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

export default function PrenotazioniPage() {
  return (
    <Suspense fallback={null}>
      <PrenotazioniPageContent />
    </Suspense>
  );
}
