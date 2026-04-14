"use client";

import { EXPORT_FETCH_LIMIT } from '@/config/defaults';
import { useCustomers } from '@/hooks/domain';
import { useFormTemplates } from '@/hooks/domain/useFormTemplates';
import { bookingService } from '@/services/booking.service';
import type { CreateBookingData } from '@/types/booking';
import type { FieldDef } from '@/types/form-template';
import { notifyError, notifySuccess } from '@/utils/toast';
import { validateBookingData } from '@/utils/validation';
import { useEffect, useMemo, useState } from 'react';
import FormInput from '../forms/FormInput';
import FormSelect from '../forms/FormSelect';
import SubmitButton from '../forms/SubmitButton';
import Modal from './Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PERCENTUALE_OPTIONS = [
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
  { value: 'custom', label: 'Libero' },
];

export default function BookingModal({ isOpen, onClose, onSuccess }: Props) {
  const [customerId, setCustomerId] = useState('');
  const [artistId, setArtistId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [price, setPrice] = useState('');
  const [deposit, setDeposit] = useState('');
  const [percentualeMode, setPercentualeMode] = useState('50');
  const [customPercentuale, setCustomPercentuale] = useState('');
  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const [availableArtists, setAvailableArtists] = useState<any[]>([]);
  const [loadingArtists, setLoadingArtists] = useState(false);

  const { data: customerResult } = useCustomers({ page: 1, limit: EXPORT_FETCH_LIMIT, enabled: isOpen });
  const { data: templates } = useFormTemplates();
  const customers = customerResult?.data;

  // Carica artisti disponibili quando cambiano data o ora
  useEffect(() => {
    if (date && time && isOpen) {
      const fetchAvailable = async () => {
        setLoadingArtists(true);
        try {
          // Creiamo una data ISO pulita per il backend
          const isoDate = new Date(`${date}T${time}`).toISOString();
          const data = await bookingService.getAvailableArtists(isoDate);
          setAvailableArtists(data);
          
          // Se l'artista precedentemente selezionato non è più disponibile, resettalo
          if (artistId && !data.find((a: any) => a.id === artistId)) {
            setArtistId('');
          }
        } catch (err) {
          notifyError(err, 'Errore nel recupero artisti disponibili');
        } finally {
          setLoadingArtists(false);
        }
      };
      fetchAvailable();
    } else {
      setAvailableArtists([]);
      setArtistId('');
    }
  }, [date, time, isOpen]);

  const dynamicFields = useMemo<FieldDef[]>(() => {
    if (!templates || templates.length === 0) return [];
    try {
      const jsonStr = atob(templates[0].schemaB64);
      return JSON.parse(jsonStr);
    } catch {
      return [];
    }
  }, [templates]);

  const percentuale = percentualeMode === 'custom'
    ? Number(customPercentuale) || 0
    : Number(percentualeMode) || 0;

  const prezzoNum = Number(price) || 0;
  const prezzoArtista = Math.round((prezzoNum * percentuale / 100) * 100) / 100;
  const guadagno = Math.round((prezzoNum - prezzoArtista) * 100) / 100;

  const handleDynamicChange = (name: string, value: string) => {
    setDynamicValues(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setCustomerId('');
    setArtistId('');
    setDate('');
    setTime('');
    setPrice('');
    setDeposit('');
    setPercentualeMode('50');
    setCustomPercentuale('');
    setDynamicValues({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !artistId || !date || !time) {
      notifyError(new Error('Compila tutti i campi obbligatori'), 'Campi mancanti');
      return;
    }

    const bookingDate = new Date(`${date}T${time}`).toISOString();

    const formData: Record<string, unknown> = {};
    formData.artistPercentage = percentuale;
    formData.artistPrice = prezzoArtista;
    formData.studioProfit = guadagno;
    for (const field of dynamicFields) {
      const val = dynamicValues[field.name];
      if (val) formData[field.name] = val;
    }

    const data: CreateBookingData = {
      customerId,
      artistId,
      date: bookingDate,
      price: prezzoNum || undefined,
      deposit: Number(deposit) || undefined,
      formData,
    };

    const validationError = validateBookingData({ ...data, time });
    if (validationError) {
      notifyError(new Error(validationError), validationError);
      return;
    }

    setLoading(true);
    try {
      await bookingService.create(data);
      notifySuccess(`Prenotazione confermata!`);
      resetForm();
      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      notifyError(error, 'Errore nella prenotazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuova Prenotazione" maxWidth="max-w-4xl">
      <form className="space-y-5" onSubmit={handleSubmit}>
        
        {/* Step 1: Data e Ora */}
        <div className="bg-white/5 border border-surface-border p-4 rounded-xl space-y-4">
          <h3 className="text-xs font-bold text-accent uppercase tracking-wider">1. Quando vuoi prenotare?</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Data *" type="date" required value={date} onChange={setDate} />
            <FormInput label="Ora *" type="time" required value={time} onChange={setTime} />
          </div>
        </div>

        {/* Step 2: Cliente e Artista (filtrato) */}
        <div className={`p-4 rounded-xl border transition-all duration-300 ${(!date || !time) ? 'opacity-50 grayscale pointer-events-none bg-black/20 border-transparent' : 'bg-white/5 border-surface-border'}`}>
          <h3 className="text-xs font-bold text-accent uppercase tracking-wider mb-4">2. Chi coinvolge?</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="Cliente *"
              value={customerId}
              onChange={setCustomerId}
              placeholder="Seleziona cliente..."
              required
              options={(customers || []).map((c) => ({
                value: c.id,
                label: `${c.firstName} ${c.lastName}`,
              }))}
            />
            <FormSelect
              label="Artista Disponibile *"
              value={artistId}
              onChange={setArtistId}
              disabled={loadingArtists || availableArtists.length === 0}
              placeholder={loadingArtists ? 'Ricerca disponibilità...' : availableArtists.length === 0 ? 'Nessun artista libero' : 'Seleziona artista...'}
              required
              options={availableArtists.map((a) => ({
                value: a.id,
                label: a.name,
              }))}
            />
          </div>
          {date && time && !loadingArtists && availableArtists.length === 0 && (
            <p className="text-[10px] text-danger mt-2 italic">Attenzione: nessun artista ha un turno che copre questo orario o sono tutti occupati.</p>
          )}
        </div>

        {/* Step 3: Dettagli Economici */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <FormInput label="Prezzo Finale (€)" type="number" value={price} onChange={setPrice} placeholder="0.00" min={0} step="0.01" />
          <FormInput label="Acconto (€)" type="number" value={deposit} onChange={setDeposit} placeholder="0.00" min={0} step="0.01" />
          
          <FormSelect
            label="% Artista"
            value={percentualeMode}
            onChange={setPercentualeMode}
            options={PERCENTUALE_OPTIONS}
          />

          <div className="flex flex-col justify-end">
             {percentualeMode === 'custom' && (
                <FormInput
                  label="% libera"
                  type="number"
                  value={customPercentuale}
                  onChange={setCustomPercentuale}
                  placeholder="35"
                  min={0}
                  max={100}
                />
            )}
          </div>
        </div>

        {/* Riassunto economico */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 border border-surface-border rounded-xl p-3 text-center">
            <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-1">Quota Artista ({percentuale}%)</p>
            <p className="text-xl font-bold text-orange-400">€{prezzoArtista.toFixed(2)}</p>
          </div>
          <div className="bg-white/5 border border-surface-border rounded-xl p-3 text-center">
            <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-1">Guadagno Studio ({100 - percentuale}%)</p>
            <p className="text-xl font-bold text-green-400">€{guadagno.toFixed(2)}</p>
          </div>
        </div>

        {/* Campi dinamici */}
        {dynamicFields.length > 0 && (
          <div className="border-t border-surface-border pt-4">
            <h3 className="text-sm font-semibold text-white mb-3">Dettagli Progetto</h3>
            <div className="grid grid-cols-2 gap-4">
              {dynamicFields.map((field) => {
                if (field.type === 'select') {
                  return (
                    <FormSelect
                      key={field.name}
                      label={field.label}
                      value={dynamicValues[field.name] || ''}
                      onChange={(val) => handleDynamicChange(field.name, val)}
                      placeholder="Seleziona..."
                      required={field.required}
                      options={(field.options || []).map((o) => ({ value: o, label: o }))}
                    />
                  );
                }
                return (
                  <FormInput
                    key={field.name}
                    label={field.label}
                    type={field.type === 'number' ? 'number' : 'text'}
                    value={dynamicValues[field.name] || ''}
                    onChange={(val) => handleDynamicChange(field.name, val)}
                    placeholder={field.label}
                    required={field.required}
                  />
                );
              })}
            </div>
          </div>
        )}

        <SubmitButton loading={loading} label="Conferma Prenotazione" />
      </form>
    </Modal>
  );
}
