"use client";

import type { EventClickArg } from '@fullcalendar/core';
import type { DateClickArg } from '@fullcalendar/interaction';
import { format } from 'date-fns';
import { useCallback, useState } from 'react';

import { useBookings } from '@/modules/booking/hooks/useBooking';
import { useBookingDelete } from '@/modules/booking/hooks/useBookingDelete';
import type { BookingModel } from '@/modules/booking/model/booking.model';

interface AgendaBookingsState {
  isModalOpen: boolean;
  editingBooking: BookingModel | null;
  whatsAppBooking: BookingModel | null;
  initialDate: string;
  initialTime: string;
  currentMonth: string;
  showDeletePasswordModal: boolean;
  showDeleteConfirm: boolean;
  deletePasswordLoading: boolean;
}

interface AgendaBookingsHandlers {
  handleDeleteBooking: (id: number) => void;
  confirmSuperAdminDelete: (refund: boolean) => Promise<void>;
  closeDeleteConfirm: () => void;
  handlePasswordDelete: (password: string, refund?: boolean) => Promise<void>;
  handleEditBooking: (booking: BookingModel) => void;
  handleDateClick: (arg: DateClickArg) => void;
  handleEventClick: (arg: EventClickArg) => void;
  setIsModalOpen: (open: boolean) => void;
  setEditingBooking: (booking: BookingModel | null) => void;
  setWhatsAppBooking: (booking: BookingModel | null) => void;
  setCurrentMonth: (month: string) => void;
  setShowDeletePasswordModal: (show: boolean) => void;
  setPendingDeleteId: (id: number | null) => void;
}

interface AgendaBookingsResult extends AgendaBookingsState, AgendaBookingsHandlers {
  bookings: BookingModel[] | undefined;
  isLoading: boolean;
  error: unknown;
  mutate: () => Promise<unknown>;
}

export function useAgendaBookings(): AgendaBookingsResult {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<BookingModel | null>(null);
  const [whatsAppBooking, setWhatsAppBooking] = useState<BookingModel | null>(null);
  const [initialDate, setInitialDate] = useState('');
  const [initialTime, setInitialTime] = useState('');
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));

  const { data: bookingsResult, mutate, isLoading, error } = useBookings({ month: currentMonth });
  const bookings = bookingsResult?.data ?? [];

  const {
    setPendingDeleteId,
    showDeletePasswordModal,
    setShowDeletePasswordModal,
    showDeleteConfirm,
    deletePasswordLoading,
    handleDelete: handleDeleteBooking,
    confirmSuperAdminDelete,
    closeDeleteConfirm,
    handlePasswordDelete,
  } = useBookingDelete(mutate);

  const handleEditBooking = useCallback((booking: BookingModel) => {
    setEditingBooking(booking);
    setInitialDate('');
    setInitialTime('');
    setIsModalOpen(true);
  }, []);

  const handleDateClick = useCallback((arg: DateClickArg) => {
    const d = new Date(arg.date);
    setEditingBooking(null);
    setInitialDate(format(d, 'yyyy-MM-dd'));
    setInitialTime(format(d, 'HH:mm'));
    setIsModalOpen(true);
  }, []);

  const handleEventClick = useCallback((arg: EventClickArg) => {
    const booking = arg.event.extendedProps.booking as BookingModel;
    if (booking.status === 'COMPLETATO') {
      return;
    }
    handleEditBooking(booking);
  }, [handleEditBooking]);

  return {
    bookings,
    isLoading,
    error,
    mutate,
    isModalOpen,
    editingBooking,
    whatsAppBooking,
    initialDate,
    initialTime,
    currentMonth,
    showDeletePasswordModal,
    showDeleteConfirm,
    deletePasswordLoading,
    handleDeleteBooking,
    confirmSuperAdminDelete,
    closeDeleteConfirm,
    handlePasswordDelete,
    handleEditBooking,
    handleDateClick,
    handleEventClick,
    setIsModalOpen,
    setEditingBooking,
    setWhatsAppBooking,
    setCurrentMonth,
    setShowDeletePasswordModal,
    setPendingDeleteId,
  };
}
