"use client";

import type { EventClickArg } from '@fullcalendar/core';
import type { DateClickArg } from '@fullcalendar/interaction';
import { format } from 'date-fns';
import { useCallback, useState } from 'react';

import { useAuth } from '@/common/context/AuthContext';
import { bookingApi as bookingService } from '@/modules/booking/api/booking.api';
import { useBookings } from '@/modules/booking/hooks/useBooking';
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
  handleDeleteBooking: (id: number) => Promise<void>;
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
  const { isSuperAdmin } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<BookingModel | null>(null);
  const [whatsAppBooking, setWhatsAppBooking] = useState<BookingModel | null>(null);
  const [initialDate, setInitialDate] = useState('');
  const [initialTime, setInitialTime] = useState('');
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [showDeletePasswordModal, setShowDeletePasswordModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePasswordLoading, setDeletePasswordLoading] = useState(false);

  const { data: bookingsResult, mutate, isLoading, error } = useBookings({ month: currentMonth });
  const bookings = bookingsResult?.data ?? [];

  const handleDeleteBooking = useCallback(async (id: number) => {
    setPendingDeleteId(id);
    if (isSuperAdmin) {
      setShowDeleteConfirm(true);
    } else {
      setShowDeletePasswordModal(true);
    }
  }, [isSuperAdmin]);

  const confirmSuperAdminDelete = useCallback(async (refund: boolean) => {
    if (!pendingDeleteId) return;
    const idToDelete = pendingDeleteId;
    setShowDeleteConfirm(false);
    setPendingDeleteId(null);
    await bookingService.delete(idToDelete, refund);
    await mutate();
  }, [pendingDeleteId, mutate]);

  const closeDeleteConfirm = useCallback(() => {
    setShowDeleteConfirm(false);
    setPendingDeleteId(null);
  }, []);

  const handlePasswordDelete = useCallback(async (password: string, refund: boolean = true) => {
    if (!pendingDeleteId) return;
    setDeletePasswordLoading(true);
    try {
      await bookingService.verifyPassword(password);
      setShowDeletePasswordModal(false);
      const idToDelete = pendingDeleteId;
      setPendingDeleteId(null);
      await bookingService.delete(idToDelete, refund);
      await mutate();
    } catch {
      throw new Error('Password non corretta');
    } finally {
      setDeletePasswordLoading(false);
    }
  }, [pendingDeleteId, mutate]);

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
