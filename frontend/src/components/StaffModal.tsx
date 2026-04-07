"use client";

import { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { teamService } from '@/services/team.service';
import { Role } from '@/types/enums';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const EMPTY = { name: '', email: '', password: '', role: Role.ARTIST, phone: '' };

export default function StaffModal({ isOpen, onClose }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const set = <K extends keyof typeof EMPTY>(field: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await teamService.createUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone || undefined,
      });
      toast.success('Staff aggiunto');
      setForm(EMPTY);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Errore durante l\'inserimento');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full p-3 rounded-xl bg-white/5 border border-surface-border text-white focus:outline-none focus:border-accent transition appearance-none';

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-2000 p-4">
      <div className="bg-[#0a0a0a] border border-surface-border rounded-[35px] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 border-b border-surface-border flex justify-between items-center bg-white/2">
          <h3 className="text-2xl font-outfit text-white font-semibold">Aggiungi Staff</h3>
          <button onClick={onClose} type="button" className="p-2 hover:bg-white/10 rounded-full transition">
            <X size={24} className="text-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-2">
            <label className="text-text-secondary text-sm px-1">Nome *</label>
            <input required type="text" placeholder="Nome del collaboratore" className={inputCls} value={form.name} onChange={set('name')} />
          </div>

          <div className="space-y-2">
            <label className="text-text-secondary text-sm px-1">Email *</label>
            <input required type="email" placeholder="email@studio.it" className={inputCls} value={form.email} onChange={set('email')} />
          </div>

          <div className="space-y-2">
            <label className="text-text-secondary text-sm px-1">Password *</label>
            <input required type="password" placeholder="Min. 6 caratteri" className={inputCls} value={form.password} onChange={set('password')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-text-secondary text-sm px-1">Ruolo *</label>
              <select className={inputCls} value={form.role} onChange={set('role')}>
                <option value={Role.ARTIST}  className="bg-[#0a0a0a]">Tatuatore</option>
                <option value={Role.USER}    className="bg-[#0a0a0a]">Staff</option>
                <option value={Role.ADMIN}   className="bg-[#0a0a0a]">Admin</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-text-secondary text-sm px-1">Telefono</label>
              <input type="tel" placeholder="+39 333..." className={inputCls} value={form.phone} onChange={set('phone')} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-lg">
            {loading ? <Loader2 className="animate-spin" size={22} /> : <Save size={22} />}
            <span>Crea Profilo</span>
          </button>
        </form>
      </div>
    </div>
  );
}
