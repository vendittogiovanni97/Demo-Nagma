"use client";

import { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { transactionService } from '@/services/transaction.service';
import { TransactionType } from '@/types/enums';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: Record<TransactionType, string[]> = {
  [TransactionType.EXPENSE]: ['Affitto', 'Materiali', 'Forniture', 'Utenze', 'Altro'],
  [TransactionType.INCOME]:  ['Tatuaggio', 'Touch-up', 'Consulenza', 'Vendita Prodotti', 'Altro'],
};

const EMPTY = { description: '', amount: '', type: TransactionType.EXPENSE, category: 'Forniture' };

export default function TransactionModal({ isOpen, onClose }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const set = <K extends keyof typeof EMPTY>(field: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as TransactionType;
    setForm(prev => ({ ...prev, type, category: CATEGORIES[type][0] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await transactionService.create({
        description: form.description,
        amount: Number(form.amount),
        type: form.type,
        category: form.category,
      });
      toast.success('Transazione registrata');
      setForm(EMPTY);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Errore nel salvataggio');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full p-3 rounded-xl bg-white/5 border border-surface-border text-white focus:outline-none focus:border-accent transition appearance-none';

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-2000 p-4">
      <div className="bg-[#0a0a0a] border border-surface-border rounded-[35px] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 border-b border-surface-border flex justify-between items-center bg-white/2">
          <h3 className="text-2xl font-outfit text-white font-semibold">Nuovo Movimento</h3>
          <button onClick={onClose} type="button" className="p-2 hover:bg-white/10 rounded-full transition">
            <X size={24} className="text-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-2">
            <label className="text-text-secondary text-sm px-1">Descrizione</label>
            <input
              required
              type="text"
              placeholder="Es. Affitto, Colori, Acconto Cliente..."
              className={inputCls}
              value={form.description}
              onChange={set('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-text-secondary text-sm px-1">Tipo</label>
              <select className={inputCls} value={form.type} onChange={handleTypeChange}>
                <option value={TransactionType.EXPENSE} className="bg-[#0a0a0a]">Uscita (Spesa)</option>
                <option value={TransactionType.INCOME}  className="bg-[#0a0a0a]">Entrata</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-text-secondary text-sm px-1">Categoria</label>
              <select className={inputCls} value={form.category} onChange={set('category')}>
                {CATEGORIES[form.type].map(c => (
                  <option key={c} value={c} className="bg-[#0a0a0a]">{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-text-secondary text-sm px-1">Importo (€)</label>
            <input
              required
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              className={inputCls}
              value={form.amount}
              onChange={set('amount')}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-lg">
            {loading ? <Loader2 className="animate-spin" size={22} /> : <Save size={22} />}
            <span>Registra</span>
          </button>
        </form>
      </div>
    </div>
  );
}
