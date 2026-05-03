"use client";

import type { EventClickArg } from '@fullcalendar/core';
import type { DateClickArg } from '@fullcalendar/interaction';
import { format } from 'date-fns';
import { useCallback, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { useBookings } from '@/modules/booking/hooks/useBooking';
import { bookingApi as bookingService } from '@/modules/booking/api/booking.api';
import type { Booking } from '@/modules/booking/model/booking.types';

interface AgendaBookingsState {
  isModalOpen: boolean;
  editingBooking: Booking | null;
  whatsAppBooking: Booking | null;
  initialDate: string;
  initialTime: string;
  currentMonth: string;
  showDeletePasswordModal: boolean;
  deletePasswordLoading: boolean;
}

interface AgendaBookingsHandlers {
  handleDeleteBooking: (id: number) => Promise<void>;
  handleSuperAdminDelete: (id: number) => Promise<void>;
  handlePasswordDelete: (password: string) => Promise<void>;
  handleEditBooking: (booking: Booking) => void;
  handleDateClick: (arg: DateClickArg) => void;
  handleEventClick: (arg: EventClickArg) => void;
  setIsModalOpen: (open: boolean) => void;
  setEditingBooking: (booking: Booking | null) => void;
  setWhatsAppBooking: (booking: Booking | null) => void;
  setCurrentMonth: (month: string) => void;
  setShowDeletePasswordModal: (show: boolean) => void;
  setPendingDeleteId: (id: number | null) => void;
}

interface AgendaBookingsResult extends AgendaBookingsState, AgendaBookingsHandlers {
  bookings: Booking[] | undefined;
  isLoading: boolean;
  error: unknown;
  mutate: () => Promise<unknown>;
}

export function useAgendaBookings(): AgendaBookingsResult {
  const { isSuperAdmin } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [whatsAppBooking, setWhatsAppBooking] = useState<Booking | null>(null);
  const [initialDate, setInitialDate] = useState('');
  const [initialTime, setInitialTime] = useState('');
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [showDeletePasswordModal, setShowDeletePasswordModal] = useState(false);
  const [deletePasswordLoading, setDeletePasswordLoading] = useState(false);

  const { data: bookingsResult, mutate, isLoading, error } = useBookings({ month: currentMonth });
  const bookings = (bookingsResult?.data ?? []) as unknown as Booking[];

  const handleDeleteBooking = useCallback(async (id: number) => {
    setPendingDeleteId(id);
    if (isSuperAdmin) {
      setShowDeletePasswordModal(false);
      await bookingService.delete(id);
      await mutate();
    } else {
      setShowDeletePasswordModal(true);
    }
  }, [isSuperAdmin, mutate]);

  const handleSuperAdminDelete = useCallback(async (id: number) => {
    await bookingService.delete(id);
    await mutate();
  }, [mutate]);

  const handlePasswordDelete = useCallback(async (password: string) => {
    if (!pendingDeleteId) return;
    setDeletePasswordLoading(true);
    try {
      await bookingService.verifyPassword(password);
      setShowDeletePasswordModal(false);
      const idToDelete = pendingDeleteId;
      setPendingDeleteId(null);
      await bookingService.delete(idToDelete);
      await mutate();
    } catch {
      throw new Error('Password non corretta');
    } finally {
      setDeletePasswordLoading(false);
    }
  }, [pendingDeleteId, mutate]);

  const handleEditBooking = useCallback((booking: Booking) => {
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
    const booking = arg.event.extendedProps.booking as Booking;
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
    deletePasswordLoading,
    handleDeleteBooking,
    handleSuperAdminDelete,
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
