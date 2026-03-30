"use client";

import { X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionModal({ isOpen, onClose }: TransactionModalProps) {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('EXPENSE');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;

    setLoading(true);
    try {
      await fetch('http://localhost:3001/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: desc,
          amount: Number(amount),
          type,
          category: type === 'INCOME' ? 'Servizi' : 'Forniture' // Semplificazione per ora
        })
      });
      // Resetta stato
      setDesc('');
      setAmount('');
      setType('EXPENSE');
      toast.success('Transazione registrata con successo!');
      onClose(); // Ritorna al parent che triggerà il mutate SWR
    } catch (e: any) {
      toast.error('Errore nel salvare la transazione: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-[2000]">
      <div className="bg-[#0a0a0a] border border-surface-border p-10 rounded-[35px] w-[600px] max-w-[90%] shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-outfit text-white font-semibold">Nuova Voce Spesa / Entrata</h3>
          <button onClick={onClose} className="glass-btn !p-2" type="button">
            <X size={24} />
          </button>
        </div>
        
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-text-secondary">Descrizione</label>
            <input 
              required
              type="text" 
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Es. Affitto, Colori, Acconto Cliente..." 
              className="w-full p-3 rounded-[10px] bg-white/5 border border-surface-border text-white focus:outline-none focus:border-accent transition"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-text-secondary">Importo (€)</label>
              <input 
                required
                type="number" 
                step="0.01"
                min="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00" 
                className="w-full p-3 rounded-[10px] bg-white/5 border border-surface-border text-white focus:outline-none focus:border-accent transition"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-text-secondary">Tipo</label>
              <select 
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full p-3 rounded-[10px] bg-white/5 border border-surface-border text-white focus:outline-none focus:border-accent transition appearance-none"
              >
                <option value="EXPENSE" className="bg-[#0a0a0a]">Spesa (Uscita)</option>
                <option value="INCOME" className="bg-[#0a0a0a]">Entrata</option>
              </select>
            </div>
          </div>
          
          <button disabled={loading} type="submit" className="btn-primary mt-4 w-full">
            {loading ? 'Registrazione in corso...' : 'Registra Transazione'}
          </button>
        </form>
      </div>
    </div>
  );
}
