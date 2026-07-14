"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/common/hooks/useToast';
import { useEntityForm, UseEntityFormReturn } from '@/common/hooks/useEntityForm';
import { bookingApi as bookingService } from '@/modules/booking/api/booking.api';
import { customerApi as customerService } from '@/modules/customer/api/customer.api';
import { staffApi as staffService } from '@/modules/staff/api/staff.api';
import { configService } from '@/common/shared/services/config.service';
import { extractErrorMessage } from '@/common/shared/utils/extract-error';
import type { Booking, BookingStatus, CreateBookingData } from '@/modules/booking/model/booking.types';
import { PERCENTUALE_OPTIONS_VALUES } from '../hooks/booking-config';
import { EXPORT_FETCH_LIMIT } from '@/common/config/env';
import { useCustomers } from '@/modules/customer/hooks/useCustomer';
import { useFormTemplates } from '@/modules/form-templates/hooks/useFormTemplates';
import type { FieldDef } from '@/modules/form-templates/model/form-template.types';

export interface ArtistOption {
  id: number;
  name: string;
  color?: string;
}

export interface BookingFormData {
  // Core booking fields
  customerId: string;
  artistId: string;
  date: string;
  time: string;
  duration: string;
  price: string;
  deposit: string;
  percentualeMode: string;
  notes: string;
  dynamicValues: Record<string, string>;
  status: BookingStatus;

  // New customer fields
  isNewCustomer: boolean;
  newCustomerFirstName: string;
  newCustomerLastName: string;
  newCustomerPhone: string;
  newCustomerEmail: string;

  // Template selection
  selectedTemplateId: number | null;

  // Loading state
  loading: boolean;
}

const INITIAL_FORM_DATA: BookingFormData = {
  customerId: '',
  artistId: '',
  date: '',
  time: '',
  duration: '120',
  price: '',
  deposit: '',
  percentualeMode: '50',
  notes: '',
  dynamicValues: {},
  status: 'CONFERMATO',
  isNewCustomer: false,
  newCustomerFirstName: '',
  newCustomerLastName: '',
  newCustomerPhone: '',
  newCustomerEmail: '',
  selectedTemplateId: null,
  loading: false,
};

const DURATION_OPTIONS = Array.from({ length: 32 }, (_, i) => {
  const minutes = (i + 1) * 30;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  let label = hours > 0 ? `${hours}h` : '';
  if (remainingMinutes > 0) label += hours > 0 ? ` ${remainingMinutes}m` : `${remainingMinutes} min`;
  return { value: minutes.toString(), label: label.trim() };
});

const PERCENTUALE_OPTIONS = [
  { value: '0', label: '0%' },
  { value: '10', label: '10%' },
  { value: '20', label: '20%' },
  { value: '30', label: '30%' },
  { value: '40', label: '40%' },
  { value: '50', label: '50%' },
  { value: '60', label: '60%' },
  { value: '70', label: '70%' },
  { value: '80', label: '80%' },
  { value: '90', label: '90%' },
  { value: '100', label: '100%' },
];

interface UseBookingFormOptions {
  isOpen: boolean;
  booking: Booking | null;
  initialDate?: string;
  initialTime?: string;
  onSuccess?: () => void;
  onClose: () => void;
  isSuperAdmin: boolean;
}

interface UseBookingFormReturn extends UseEntityFormReturn<BookingFormData> {
  // Computed values
  artistOptions: { value: string; label: string }[];
  customerOptions: { value: string; label: string }[];
  percentuale: number;
  prezzoNum: number;
  prezzoArtista: number;
  guadagno: number;
  activeTemplate: { id: number; schemaB64: string; name: string } | null;
  dynamicFields: FieldDef[];
  templates: any[];
  customersLoading: boolean;

  // Actions
  handleArtistLoad: () => Promise<void>;
  handleNewCustomerCreate: () => Promise<number | null>;
  handleSave: () => Promise<void>;
  handlePasswordConfirm: (password: string) => Promise<void>;
  resetForm: () => void;

  // State
  showPasswordModal: boolean;
  setShowPasswordModal: (show: boolean) => void;
  passwordLoading: boolean;
  setPasswordLoading: (loading: boolean) => void;
  pendingData: (CreateBookingData & { status?: BookingStatus }) | null;
  setPendingData: (data: (CreateBookingData & { status?: BookingStatus }) | null) => void;
  showSuccess: boolean;
  setShowSuccess: (show: boolean) => void;
  consentOpen: boolean;
  setConsentOpen: (open: boolean) => void;

  // Extra state for artists
  artists: ArtistOption[];
  setArtists: (artists: ArtistOption[]) => void;
  loadingArtists: boolean;
  initialArtistLoaded: boolean;
  setInitialArtistLoaded: (loaded: boolean) => void;
}

export function useBookingForm({
  isOpen,
  booking,
  initialDate,
  initialTime,
  onSuccess,
  onClose,
  isSuperAdmin,
}: UseBookingFormOptions): UseBookingFormReturn {
  const toast = useToast();

  // External data hooks
  const { data: customerResult, isLoading: customersLoading, mutate: mutateCustomers } = useCustomers({
    page: 1,
    limit: EXPORT_FETCH_LIMIT
  });
  const { data: templates } = useFormTemplates();

  // Internal state for complex UI states - DECLARE FIRST
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [pendingData, setPendingData] = useState<(CreateBookingData & { status?: BookingStatus }) | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);

  // Computed data
  const customers = customerResult?.data || [];

  // We need to track artists separately since they're loaded async
  const [artists, setArtists] = useState<ArtistOption[]>([]);
  const [loadingArtists, setLoadingArtists] = useState(false);
  const [initialArtistLoaded, setInitialArtistLoaded] = useState(false);

  // Initial values for useEntityForm
  const initial = useCallback(() => INITIAL_FORM_DATA, []);

  // Build payload for API
  const buildPayload = useCallback((formData: BookingFormData): CreateBookingData & { status?: BookingStatus } => {
    const percentuale = Number(formData.percentualeMode) || 0;
    const prezzoNum = Number(formData.price) || 0;
    const prezzoArtista = Math.round((prezzoNum * percentuale / 100) * 100) / 100;
    const guadagno = Math.round((prezzoNum - prezzoArtista) * 100) / 100;

    const formDataObj: Record<string, unknown> = {
      artistPercentage: percentuale,
      artistPrice: prezzoArtista,
      studioProfit: guadagno
    };
    Object.entries(formData.dynamicValues).forEach(([k, v]) => { if (v) formDataObj[k] = v; });

    return {
      customerId: Number(formData.customerId),
      artistId: Number(formData.artistId),
      date: new Date(`${formData.date}T${formData.time}`).toISOString(),
      duration: Number(formData.duration) || undefined,
      price: prezzoNum || undefined,
      deposit: Number(formData.deposit) || undefined,
      notes: formData.notes.trim() || undefined,
      formData: formDataObj,
      status: formData.status,
    };
  }, []);

  // Persist function
  const persist = useCallback(async (payload: CreateBookingData & { status?: BookingStatus }, entity: Booking | null) => {
    if (entity) {
      await bookingService.update(entity.id, payload);
    } else {
      await bookingService.create(payload);
    }
  }, []);

  // Validation
  const validate = useCallback((formData: BookingFormData): string | null => {
    if (!formData.customerId && !formData.isNewCustomer) return 'Seleziona un cliente';
    if (!formData.artistId || !formData.date || !formData.time) return 'Campi obbligatori mancanti';
    return null;
  }, []);

  // useEntityForm for core form management
  const form = useEntityForm<Booking | null, BookingFormData>({
    entity: booking,
    open: isOpen,
    initial,
    buildPayload,
    persist,
    successMessage: (isEdit) => isEdit ? 'Modifica salvata!' : 'Prenotazione confermata!',
    onSuccess: () => {
      toast.success(booking ? 'Modifica salvata!' : 'Prenotazione confermata!');
      onSuccess?.();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    },
    onClose: () => {
      onClose();
      setShowPasswordModal(false);
      setPendingData(null);
    },
    validate,
    errorMessage: 'Errore nel salvare la prenotazione',
  });

  const artistOptions = useMemo(() => {
    const available = artists.map(a => ({ value: a.id.toString(), label: a.name }));
    if (booking?.id && form.formData.artistId && !available.find(a => a.value === form.formData.artistId)) {
      available.unshift({ value: form.formData.artistId, label: booking.artist?.name || `Artista #${form.formData.artistId}` });
    }
    return available;
  }, [artists, booking, form.formData.artistId]);

  const customerOptions = useMemo(() =>
    customers.map(c => ({ value: c.id.toString(), label: `${c.firstName} ${c.lastName}` }))
  , [customers]);

  const activeTemplate = useMemo(() =>
    templates?.find(t => t.id === form.formData.selectedTemplateId) ?? null
  , [templates, form.formData.selectedTemplateId]);

  const dynamicFields = useMemo<FieldDef[]>(() => {
    if (!activeTemplate) return [];
    try { return JSON.parse(atob(activeTemplate.schemaB64)); } catch { return []; }
  }, [activeTemplate]);

  const percentuale = Number(form.formData.percentualeMode) || 0;
  const prezzoNum = Number(form.formData.price) || 0;
  const prezzoArtista = Math.round((prezzoNum * percentuale / 100) * 100) / 100;
  const guadagno = Math.round((prezzoNum - prezzoArtista) * 100) / 100;

  // Auto-select first template
  useEffect(() => {
    if (templates && templates.length > 0 && form.formData.selectedTemplateId === null) {
      form.setField('selectedTemplateId', templates[0].id);
    }
  }, [templates, form.formData.selectedTemplateId]);

  // Load artists when modal opens
  const handleArtistLoad = useCallback(async () => {
    if (artists.length > 1) return;
    setLoadingArtists(true);
    try {
      const data = await staffService.getAllForSelect();
      setArtists(data.map(m => ({ id: m.id, name: m.name, color: m.color || '#1976d2' })));
      setInitialArtistLoaded(true);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Errore artisti'));
    } finally {
      setLoadingArtists(false);
    }
  }, [artists.length, toast]);

  useEffect(() => {
    if (isOpen) handleArtistLoad();
  }, [isOpen, handleArtistLoad]);

  // Sync form with booking prop
  useEffect(() => {
    if (!isOpen) return;

    if (booking) {
      const d = new Date(booking.date);
      const perc = booking.formData?.artistPercentage;
      let percentualeMode = '50';
      if (perc != null) {
        const found = (PERCENTUALE_OPTIONS_VALUES as readonly string[]).includes(perc.toString());
        if (found) percentualeMode = perc.toString();
        else percentualeMode = 'custom';
      }

      let preLoadedArtists: ArtistOption[] = [];
      if (booking.artist) preLoadedArtists = [{ id: booking.artist.id, name: booking.artist.name, color: booking.artist.color }];

      form.setFields({
        customerId: booking.customerId.toString(),
        artistId: booking.artistId.toString(),
        date: d.toISOString().split('T')[0],
        time: d.toTimeString().slice(0, 5),
        duration: booking.duration?.toString() || '120',
        price: booking.price?.toString() || '',
        deposit: booking.deposit?.toString() || '',
        notes: booking.notes || '',
        percentualeMode,
        dynamicValues: booking.formData as Record<string, string> || {},
        status: booking.status ?? 'CONFERMATO',
      });

      if (preLoadedArtists.length > 0) {
        setArtists(preLoadedArtists);
      }
    } else {
      form.resetForm();
      form.setFields({
        date: initialDate || '',
        time: initialTime || '',
        duration: '120',
        percentualeMode: '50',
        status: 'CONFERMATO',
        isNewCustomer: false,
        newCustomerFirstName: '',
        newCustomerLastName: '',
        newCustomerPhone: '',
        newCustomerEmail: '',
        selectedTemplateId: null,
        dynamicValues: {},
      });
    }
  }, [booking?.id, isOpen, initialDate, initialTime, form]);

  // Handle new customer creation
  const handleNewCustomerCreate = useCallback(async (): Promise<number | null> => {
    const { newCustomerFirstName, newCustomerLastName, newCustomerPhone, newCustomerEmail } = form.formData;
    if (!newCustomerFirstName || !newCustomerLastName || !newCustomerPhone) {
      toast.error('Dati nuovo cliente mancanti');
      return null;
    }

    form.setField('loading', true);
    try {
      let cleanPhone = newCustomerPhone.trim().replace(/\s+/g, '');
      if (cleanPhone && !cleanPhone.startsWith('+') && !cleanPhone.startsWith('00')) {
        try {
          const res = await configService.getConfig();
          const prefix = res.DEFAULT_PHONE_PREFIX || '+39';
          cleanPhone = prefix + cleanPhone;
        } catch {
          cleanPhone = '+39' + cleanPhone;
        }
      }

      const newCustomer = await customerService.create({
        firstName: newCustomerFirstName,
        lastName: newCustomerLastName,
        phone: cleanPhone,
        email: newCustomerEmail.trim() || undefined,
      });

      await mutateCustomers();
      return newCustomer.id;
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Errore creazione cliente'));
      return null;
    } finally {
      form.setField('loading', false);
    }
  }, [form, toast, mutateCustomers]);

  // Main save handler
  const handleSave = useCallback(async () => {
    const { customerId, isNewCustomer } = form.formData;

    if (!customerId && !isNewCustomer) {
      toast.error('Seleziona un cliente');
      return;
    }
    if (!form.formData.artistId || !form.formData.date || !form.formData.time) {
      toast.error('Campi obbligatori mancanti');
      return;
    }

    let finalCustomerId = customerId;

    if (isNewCustomer) {
      const newId = await handleNewCustomerCreate();
      if (!newId) return;
      finalCustomerId = newId.toString();
    }

    const updatedFormData = { ...form.formData, customerId: finalCustomerId };

    if (booking?.id && !isSuperAdmin) {
      setPendingData(buildPayload(updatedFormData));
      setShowPasswordModal(true);
    } else {
      await form.handleSubmit(updatedFormData);
    }
  }, [form, booking, isSuperAdmin, toast, buildPayload, handleNewCustomerCreate]);

  // Password confirmation handler
  const handlePasswordConfirm = useCallback(async (password: string) => {
    setPasswordLoading(true);
    try {
      await bookingService.verifyPassword(password);
      setShowPasswordModal(false);
      if (pendingData) {
        // pendingData is already in the form format, just submit it
        await form.handleSubmit(pendingData as unknown as BookingFormData);
      }
    } catch {
      throw new Error('Password errata');
    } finally {
      setPasswordLoading(false);
    }
  }, [bookingService, pendingData, form]);

  // Reset form helper
  const resetForm = useCallback(() => {
    form.resetForm();
    setShowPasswordModal(false);
    setPendingData(null);
    setShowSuccess(false);
    setConsentOpen(false);
  }, [form]);

  return {
    ...form,
    // Computed
    artistOptions,
    customerOptions,
    percentuale,
    prezzoNum,
    prezzoArtista,
    guadagno,
    activeTemplate,
    dynamicFields,
    templates: templates || [],
    customersLoading,
    // Actions
    handleArtistLoad,
    handleNewCustomerCreate,
    handleSave,
    handlePasswordConfirm,
    resetForm,
    // Extra state
    showPasswordModal,
    setShowPasswordModal,
    passwordLoading,
    setPasswordLoading,
    pendingData,
    setPendingData,
    showSuccess,
    setShowSuccess,
    consentOpen,
    setConsentOpen,
    // Expose artists for sync
    artists,
    setArtists,
    loadingArtists,
    initialArtistLoaded,
    setInitialArtistLoaded,
  };
}