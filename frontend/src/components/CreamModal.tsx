"use client";

import { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { creamService } from '@/services/cream.service';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EMPTY = { name: '', brand: '', price: '', stock: '1' };

export default function CreamModal({ isOpen, onClose, onSuccess }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const set = <K extends keyof typeof EMPTY>(field: K) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await creamService.create({
        name: form.name,
        brand: form.brand || undefined,
        price: Number(form.price),
        stock: Number(form.stock),
      });
      toast.success('Prodotto aggiunto all\'inventario');
      setForm(EMPTY);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Errore durante l\'inserimento');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full p-3 rounded-xl bg-white/5 border border-surface-border text-white focus:outline-none focus:border-accent transition';

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-2000 p-4">
      <div className="bg-[#0a0a0a] border border-surface-border rounded-[35px] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 border-b border-surface-border flex justify-between items-center bg-white/2">
          <h3 className="text-2xl font-outfit text-white font-semibold">Nuovo Prodotto</h3>
          <button onClick={onClose} type="button" className="p-2 hover:bg-white/10 rounded-full transition">
            <X size={24} className="text-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-2">
            <label className="text-text-secondary text-sm px-1">Nome Prodotto *</label>
            <input required type="text" placeholder="Es. Tattoo Care Cream 50ml" className={inputCls} value={form.name} onChange={set('name')} />
          </div>

          <div className="space-y-2">
            <label className="text-text-secondary text-sm px-1">Brand</label>
            <input type="text" placeholder="Brand A, Brand B..." className={inputCls} value={form.brand} onChange={set('brand')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-text-secondary text-sm px-1">Prezzo di vendita (€) *</label>
              <input required type="number" step="0.01" min="0.01" placeholder="0.00" className={inputCls} value={form.price} onChange={set('price')} />
            </div>
            <div className="space-y-2">
              <label className="text-text-secondary text-sm px-1">Stock iniziale</label>
              <input required type="number" min="0" placeholder="0" className={inputCls} value={form.stock} onChange={set('stock')} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-lg">
            {loading ? <Loader2 className="animate-spin" size={22} /> : <Save size={22} />}
            <span>Aggiungi Prodotto</span>
          </button>
        </form>
      </div>
    </div>
  );
}
