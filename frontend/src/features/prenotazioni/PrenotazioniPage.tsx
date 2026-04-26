"use client";

import { useMemo, useState } from 'react';
import { Box, Button as MuiButton } from '@mui/material';
import { Plus } from 'lucide-react';
import PermissionGate from '@/components/auth/PermissionGate';
import PageHeader from '@/components/layout/PageHeader';
import BookingModal from '@/components/modals/BookingModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import PasswordConfirmModal from '@/components/modals/PasswordConfirmModal';
import ExportModal from '@/components/modals/ExportModal';
import { useAuth } from '@/context/AuthContext';
import { useBookings } from '@/hooks/domain/useBookings';
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm';
import type { Booking } from '@/types/booking';
import BookingFilters from './components/BookingFilters';
import BookingDataTable from './components/BookingDataTable';
import { useBookingFilters } from './hooks/useBookingFilters';
import { useBookingColumns } from './hooks/useBookingColumns';
import { useBookingActions } from './hooks/useBookingActions';

export default function PrenotazioniPage() {
  const { isSuperAdmin } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
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

  const { bookingColumns, exportColumns, exportFilters } = useBookingColumns();

  const filteredBookings = useMemo(
    () => filterBookings(bookings ?? []),
    [bookings, filterBookings],
  );

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setIsModalOpen(true);
  };

  const handleOpenNewModal = () => {
    setEditingBooking(null);
    setIsModalOpen(true);
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <PageHeader
        title="Prenotazioni"
        actions={
          <>
            <ExportModal
              filenameBase={`prenotazioni-${month}`}
              title={`Prenotazioni — ${monthLabel}`}
              rows={bookings || []}
              columns={exportColumns}
              filters={exportFilters}
              filtersLabel={`Mese: ${monthLabel}`}
              resolveRows={async () => bookings || []}
            />
            <PermissionGate requireAdmin>
              <MuiButton
                variant="contained"
                color="primary"
                startIcon={<Plus size={18} />}
                onClick={handleOpenNewModal}
              >
                Nuova Prenotazione
              </MuiButton>
            </PermissionGate>
          </>
        }
      >
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
      </PageHeader>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
