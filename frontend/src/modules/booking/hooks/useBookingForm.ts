"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import { useToast } from '@/common/hooks/useToast';
import { useEntityForm, UseEntityFormReturn } from '@/common/hooks/useEntityForm';
import { bookingApi as bookingService } from '@/modules/booking/api/booking.api';
import { customerApi as customerService } from '@/modules/customer/api/customer.api';
import { configService } from '@/common/shared/services/config.service';
import { extractErrorMessage } from '@/common/shared/utils/extract-error';
import type { Booking, BookingStatus, CreateBookingData } from '@/modules/booking/model/booking.types';
import { DEFAULT_ARTIST_COLOR } from '@/common/theme/colorTokens';
import { useCustomerAutocomplete } from '@/modules/customer/hooks/useCustomerAutocomplete';
import { useStaffForSelect } from '@/modules/staff/hooks/useStaff';
import { useFormTemplates } from '@/modules/form-templates/hooks/useFormTemplates';
import type { FieldDef } from '@/modules/form-templates/model/form-template.types';

export interface ArtistOption {
  id: number;
  name: string;
  color?: string;
  isRentPayee?: boolean;
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

// Converte un importo in numero accettando anche la virgola decimale (paste / tastiere mobili),
// coerente con Spese/Entrate. Ritorna 0 per valori vuoti o non numerici.
const parseAmount = (v: unknown): number => {
  const n = Number(String(v ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

interface UseBookingFormOptions {
  isOpen: boolean;
  booking: Booking | null;
  initialDate?: string;
  initialTime?: string;
  onSuccess?: () => void;
  onClose: () => void;
  isSuperAdmin: boolean;
  onUpdateLocalState?: (id: number, fields: Partial<any>) => void;
}

interface UseBookingFormReturn extends UseEntityFormReturn<BookingFormData> {
  // Computed values
  artistOptions: { value: string; label: string }[];
  customerOptions: { value: string; label: string }[];
  percentuale: number;
  prezzoNum: number;
  prezzoArtista: number;
  guadagno: number;
  isRentPayeeArtist: boolean;
  activeTemplate: { id: number; schemaB64: string; name: string } | null;
  dynamicFields: FieldDef[];
  templates: any[];
  customersLoading: boolean;

  // Actions
  handleNewCustomerCreate: () => Promise<number | null>;
  handleSave: () => Promise<void>;
  handlePasswordConfirm: (password: string) => Promise<void>;
  resetForm: () => void;

  // State
  showPasswordModal: boolean;
  setShowPasswordModal: (show: boolean) => void;
  passwordLoading: boolean;
  setPasswordLoading: (loading: boolean) => void;
  pendingData: BookingFormData | null;
  setPendingData: (data: BookingFormData | null) => void;
  showSuccess: boolean;
  setShowSuccess: (show: boolean) => void;

  // Extra state for artists (caricati via SWR con chiave dedicata)
  artists: ArtistOption[];
  loadingArtists: boolean;

  // Autocomplete clienti server-side
  onCustomerSearchChange: (term: string) => void;
  handleCustomerSelect: (value: string) => void;
}

export function useBookingForm({
  isOpen,
  booking,
  initialDate,
  initialTime,
  onSuccess,
  onClose,
  isSuperAdmin,
  onUpdateLocalState,
}: UseBookingFormOptions): UseBookingFormReturn {
  const toast = useToast();

  // External data hooks
  const {
    options: customerOptions,
    isLoading: customersLoading,
    setSearch: setCustomerSearch,
    handleSelect: handleCustomerSelect,
    mutate: mutateCustomers,
  } = useCustomerAutocomplete({ enabled: isOpen });
  const { data: templates } = useFormTemplates();

  // Internal state for complex UI states - DECLARE FIRST
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [pendingData, setPendingData] = useState<BookingFormData | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Computed data — gli artisti sono caricati con SWR (chiave dedicata), senza
  // la fragile cache imperativa basata su `artists.length > 1`.
  const { data: staffForSelect, isLoading: loadingArtists } = useStaffForSelect({ enabled: isOpen });

  const artists = useMemo<ArtistOption[]>(() => {
    const list = (staffForSelect ?? []).map((m) => ({
      id: m.id,
      name: m.name,
      color: m.color || DEFAULT_ARTIST_COLOR,
      isRentPayee: m.isRentPayee,
    }));
    // In modifica: mantiene l'artista della prenotazione anche se non è nella
    // lista (fallback già gestito anche da artistOptions/selectedArtist).
    if (booking?.id && booking.artist && !list.some((a) => a.id === booking.artist!.id)) {
      list.unshift({
        id: booking.artist.id,
        name: booking.artist.name,
        color: booking.artist.color || DEFAULT_ARTIST_COLOR,
        isRentPayee: false,
      });
    }
    return list;
  }, [staffForSelect, booking]);

  // Initial values for useEntityForm
  const initial = useCallback(() => INITIAL_FORM_DATA, []);

  // Build payload for API
  const buildPayload = useCallback((formData: BookingFormData): CreateBookingData & { status?: BookingStatus } => {
    const prezzoNum = parseAmount(formData.price);
    const artistPercentage = Number(formData.percentualeMode) || 0;
    const artistPrice = Math.round((prezzoNum * artistPercentage / 100) * 100) / 100;

    const formDataObj: Record<string, unknown> = {
      ...formData.dynamicValues,
      isNewCustomer: formData.isNewCustomer,
      newCustomerFirstName: formData.newCustomerFirstName,
      newCustomerLastName: formData.newCustomerLastName,
      newCustomerPhone: formData.newCustomerPhone,
      newCustomerEmail: formData.newCustomerEmail,
      percentualeMode: formData.percentualeMode,
      artistPrice,
      selectedTemplateId: formData.selectedTemplateId,
    };

    return {
      customerId: Number(formData.customerId),
      artistId: Number(formData.artistId),
      date: new Date(`${formData.date}T${formData.time}`).toISOString(),
      duration: Number(formData.duration) || undefined,
      price: prezzoNum || undefined,
      deposit: parseAmount(formData.deposit) || undefined,
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
  const form = useEntityForm<
    Booking,
    BookingFormData,
    CreateBookingData & { status?: BookingStatus }
  >({
    entity: booking,
    open: isOpen,
    initial,
    buildPayload,
    persist,
    successMessage: (isEdit) => isEdit ? 'Modifica salvata!' : 'Prenotazione confermata!',
    onSuccess: () => {
      if (booking?.id) {
        onUpdateLocalState?.(booking.id, {
          status: form.formData.status,
          price: parseAmount(form.formData.price),
          deposit: parseAmount(form.formData.deposit),
          duration: Number(form.formData.duration) || 120,
          notes: form.formData.notes,
        });
      }
      onSuccess?.();
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 500);
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

  const activeTemplate = useMemo(() =>
    templates?.find(t => t.id === form.formData.selectedTemplateId) ?? null
  , [templates, form.formData.selectedTemplateId]);

  const dynamicFields = useMemo<FieldDef[]>(() => {
    if (!activeTemplate) return [];
    try { return JSON.parse(atob(activeTemplate.schemaB64)); } catch { return []; }
  }, [activeTemplate]);

  const selectedArtist = useMemo(() => {
    if (!form.formData.artistId) return null;
    return artists.find(a => a.id.toString() === form.formData.artistId) || (booking?.artist?.id?.toString() === form.formData.artistId ? booking.artist : null);
  }, [artists, booking, form.formData.artistId]);

  const isRentPayeeArtist = Boolean((selectedArtist as any)?.isRentPayee);

  useEffect(() => {
    if (isRentPayeeArtist && form.formData.percentualeMode !== '100') {
      form.setField('percentualeMode', '100');
    }
  }, [isRentPayeeArtist, form]);

  const percentuale = isRentPayeeArtist ? 100 : (Number(form.formData.percentualeMode) || 0);
  const prezzoNum = parseAmount(form.formData.price);
  const prezzoArtista = isRentPayeeArtist ? prezzoNum : Math.round((prezzoNum * percentuale / 100) * 100) / 100;
  const guadagno = isRentPayeeArtist ? 0 : Math.round((prezzoNum - prezzoArtista) * 100) / 100;

  // Auto-select first template
  useEffect(() => {
    if (templates && templates.length > 0 && form.formData.selectedTemplateId === null) {
      form.setField('selectedTemplateId', templates[0].id);
    }
  }, [templates, form.formData.selectedTemplateId]);

  const { setFields, resetForm: formResetForm } = form;

  const prevOpenRef = useRef(isOpen);
  const prevBookingIdRef = useRef<number | null | undefined>(undefined);

  // Sync form with booking prop
  useEffect(() => {
    if (!isOpen) {
      prevOpenRef.current = false;
      return;
    }

    const isJustOpened = isOpen && !prevOpenRef.current;
    const isDifferentBooking = booking?.id !== prevBookingIdRef.current;

    if (isJustOpened || isDifferentBooking) {
      if (booking) {
        const d = new Date(booking.date);
        const perc =
          booking.formData?.percentualeMode ??
          booking.formData?.artistPercentage;
        // Usa sempre il valore numerico reale. Per i dati legacy salvati come
        // 'custom' ricava la percentuale da artistPrice/prezzo, così la tendina
        // mostra un valore selezionabile e il calcolo non azzera l'artista.
        let percentualeMode = '50';
        if (perc != null && perc !== 'custom') {
          percentualeMode = perc.toString();
        } else if (perc === 'custom') {
          const ap = Number(booking.formData?.artistPrice) || 0;
          const pr = Number(booking.price) || 0;
          percentualeMode = pr > 0 ? Math.round((ap / pr) * 100).toString() : '0';
        }

        setFields({
          customerId: booking.customerId.toString(),
          artistId: booking.artistId.toString(),
          date: format(d, 'yyyy-MM-dd'),
          time: format(d, 'HH:mm'),
          duration: booking.duration?.toString() || '120',
          price: booking.price?.toString() || '',
          deposit: booking.deposit?.toString() || '',
          notes: booking.notes || '',
          percentualeMode,
          dynamicValues: booking.formData as Record<string, string> || {},
          status: booking.status ?? 'CONFERMATO',
        });
      } else {
        formResetForm();
        setFields({
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
    }

    prevOpenRef.current = isOpen;
    prevBookingIdRef.current = booking?.id;
  }, [booking, isOpen, initialDate, initialTime, setFields, formResetForm]);

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
      toast.success('Cliente creato');
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

    let updatedFormData = { ...form.formData, customerId: finalCustomerId };

    // In modifica: stato automatico → SPOSTATO se cambiano data/ora, MODIFICATO se cambia altro.
    // Le scelte esplicite (Annullato/Cancellato/Completato) non vengono sovrascritte.
    // Confronto coi valori ORIGINALI della prenotazione (stesse formule usate per popolare il form).
    if (booking?.id) {
      const s = updatedFormData.status;
      const isExplicit = s === 'ANNULLATO' || s === 'CANCELLATO' || s === 'COMPLETATO';
      if (!isExplicit) {
        const orig = new Date(booking.date);
        const origDate = format(orig, 'yyyy-MM-dd');
        const origTime = format(orig, 'HH:mm');
        const dateTimeChanged =
          updatedFormData.date !== origDate || updatedFormData.time !== origTime;
        const otherChanged =
          updatedFormData.artistId !== booking.artistId?.toString() ||
          updatedFormData.price !== (booking.price?.toString() || '') ||
          updatedFormData.deposit !== (booking.deposit?.toString() || '') ||
          updatedFormData.duration !== (booking.duration?.toString() || '120') ||
          (updatedFormData.notes || '') !== (booking.notes || '');
        if (dateTimeChanged) {
          updatedFormData = { ...updatedFormData, status: 'SPOSTATO' };
        } else if (otherChanged) {
          updatedFormData = { ...updatedFormData, status: 'MODIFICATO' };
        }
      }
    }

    if (booking?.id && !isSuperAdmin) {
      setPendingData(updatedFormData);
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
        await form.handleSubmit(pendingData);
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
    isRentPayeeArtist,
    activeTemplate,
    dynamicFields,
    templates: templates || [],
    customersLoading,
    // Actions
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
    // Artists (SWR) e autocomplete clienti server-side
    artists,
    loadingArtists,
    onCustomerSearchChange: setCustomerSearch,
    handleCustomerSelect,
  };
}
