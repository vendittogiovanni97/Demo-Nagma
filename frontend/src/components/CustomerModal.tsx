"use client";

import { useState, useEffect } from 'react';
import { X, User, Phone, Mail, FileText, Save, Loader2 } from 'lucide-react';
import { customerService } from '@/services/customer.service';
import { Customer } from '@/types/customer';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customer?: Customer | null;
}

const EMPTY = { firstName: '', lastName: '', phone: '', email: '', notes: '' };

export default function CustomerModal({ isOpen, onClose, onSuccess, customer }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(customer
      ? { firstName: customer.firstName, lastName: customer.lastName, phone: customer.phone, email: customer.email ?? '', notes: customer.notes ?? '' }
      : EMPTY
    );
  }, [customer, isOpen]);

  if (!isOpen) return null;

  const set = (field: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (customer) {
        await customerService.update(customer.id, form);
        toast.success('Cliente aggiornato');
      } else {
        await customerService.create(form);
        toast.success('Cliente creato');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Errore durante l\'operazione');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full bg-white/5 border border-surface-border rounded-xl p-3 text-white focus:outline-none focus:border-accent transition-all';

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-2005 p-4">
      <div className="bg-[#0a0a0a] border border-surface-border rounded-[35px] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 border-b border-surface-border flex justify-between items-center bg-white/2">
          <h3 className="text-2xl font-outfit text-white font-semibold">
            {customer ? 'Modifica Cliente' : 'Nuovo Cliente'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
            <X size={24} className="text-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-text-secondary text-sm flex items-center gap-2 px-1"><User size={14} /> Nome</label>
              <input required className={inputCls} value={form.firstName} onChange={set('firstName')} />
            </div>
            <div className="space-y-2">
              <label className="text-text-secondary text-sm flex items-center gap-2 px-1"><User size={14} /> Cognome</label>
              <input required className={inputCls} value={form.lastName} onChange={set('lastName')} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-text-secondary text-sm flex items-center gap-2 px-1"><Phone size={14} /> Telefono</label>
            <input required className={inputCls} value={form.phone} onChange={set('phone')} />
          </div>

          <div className="space-y-2">
            <label className="text-text-secondary text-sm flex items-center gap-2 px-1"><Mail size={14} /> Email (opzionale)</label>
            <input type="email" className={inputCls} value={form.email} onChange={set('email')} />
          </div>

          <div className="space-y-2">
            <label className="text-text-secondary text-sm flex items-center gap-2 px-1"><FileText size={14} /> Note / Allergie / Consensi</label>
            <textarea rows={3} className={`${inputCls} resize-none`} value={form.notes} onChange={set('notes')} />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-lg">
            {loading ? <Loader2 className="animate-spin" size={22} /> : <Save size={22} />}
            <span>{customer ? 'Salva Modifiche' : 'Crea Cliente'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
