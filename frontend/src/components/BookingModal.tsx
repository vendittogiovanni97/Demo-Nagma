"use client";

import { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import useSWR from 'swr';
import { bookingService } from '@/services/booking.service';
import { customerService } from '@/services/customer.service';
import { teamService } from '@/services/team.service';
import { ENDPOINTS } from '@/api/endpoints';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const EMPTY = {
  customerId: '',
  artistId: '',
  date: '',
  time: '',
  duration: '60',
  type: 'Tattoo',
  price: '',
  deposit: '',
  notes: '',
};

export default function BookingModal({ isOpen, onClose, onSuccess }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  const { data: customers } = useSWR(
    isOpen ? '/api/customers-list' : null,
    () => customerService.getAll(undefined, 1, 100)
  );
  const { data: artists } = useSWR(
    isOpen ? ENDPOINTS.TEAM.USERS : null,
    () => teamService.getUsers()
  );

  if (!isOpen) return null;

  const set = <K extends keyof typeof EMPTY>(field: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId || !form.artistId || !form.date || !form.time) {
      toast.error('Cliente, artista, data e ora sono obbligatori');
      return;
    }
    setLoading(true);
    try {
      await bookingService.create({
        customerId: form.customerId,
        artistId: form.artistId,
        date: `${form.date}T${form.time}:00`,
        duration: Number(form.duration),
        type: form.type,
        price: form.price ? Number(form.price) : undefined,
        deposit: form.deposit ? Number(form.deposit) : undefined,
        notes: form.notes || undefined,
      });
      toast.success('Prenotazione creata');
      setForm(EMPTY);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Errore durante la creazione');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full p-3 rounded-xl bg-white/5 border border-surface-border text-white focus:outline-none focus:border-accent transition appearance-none';

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-2000 p-4">
      <div className="bg-[#0a0a0a] border border-surface-border rounded-[35px] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 border-b border-surface-border flex justify-between items-center bg-white/2">
          <h3 className="text-2xl font-outfit text-white font-semibold">Nuova Prenotazione</h3>
          <button onClick={onClose} type="button" className="p-2 hover:bg-white/10 rounded-full transition">
            <X size={24} className="text-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-2">
            <label className="text-text-secondary text-sm px-1">Cliente *</label>
            <select required className={inputCls} value={form.customerId} onChange={set('customerId')}>
              <option value="" className="bg-[#0a0a0a]">Seleziona cliente...</option>
              {customers?.data.map(c => (
                <option key={c.id} value={c.id} className="bg-[#0a0a0a]">{c.firstName} {c.lastName}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-text-secondary text-sm px-1">Artista *</label>
            <select required className={inputCls} value={form.artistId} onChange={set('artistId')}>
              <option value="" className="bg-[#0a0a0a]">Seleziona artista...</option>
              {artists?.map(a => (
                <option key={a.id} value={a.id} className="bg-[#0a0a0a]">{a.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-text-secondary text-sm px-1">Data *</label>
              <input required type="date" className={inputCls} value={form.date} onChange={set('date')} />
            </div>
            <div className="space-y-2">
              <label className="text-text-secondary text-sm px-1">Ora *</label>
              <input required type="time" className={inputCls} value={form.time} onChange={set('time')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-text-secondary text-sm px-1">Tipo</label>
              <select className={inputCls} value={form.type} onChange={set('type')}>
                {['Tattoo', 'Touch-up', 'Consulenza', 'Piercing'].map(t => (
                  <option key={t} value={t} className="bg-[#0a0a0a]">{t}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-text-secondary text-sm px-1">Durata (min)</label>
              <input type="number" min="15" step="15" className={inputCls} value={form.duration} onChange={set('duration')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-text-secondary text-sm px-1">Prezzo (€)</label>
              <input type="number" step="0.01" min="0" placeholder="0.00" className={inputCls} value={form.price} onChange={set('price')} />
            </div>
            <div className="space-y-2">
              <label className="text-text-secondary text-sm px-1">Acconto (€)</label>
              <input type="number" step="0.01" min="0" placeholder="0.00" className={inputCls} value={form.deposit} onChange={set('deposit')} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-text-secondary text-sm px-1">Note</label>
            <textarea rows={2} className={`${inputCls} resize-none`} value={form.notes} onChange={set('notes')} />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-lg">
            {loading ? <Loader2 className="animate-spin" size={22} /> : <Save size={22} />}
            <span>Conferma Prenotazione</span>
          </button>
        </form>
      </div>
    </div>
  );
}
