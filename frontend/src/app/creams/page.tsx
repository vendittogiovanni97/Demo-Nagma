"use client";

import { useState } from 'react';
import useSWR from 'swr';
import { creamService } from '@/services/cream.service';
import { teamService } from '@/services/team.service';
import { ENDPOINTS } from '@/api/endpoints';
import { Cream, User } from '@/types/customer';
import { Package, Plus, ShoppingCart, AlertTriangle, Loader2 } from 'lucide-react';
import CreamModal from '@/components/CreamModal';
import toast from 'react-hot-toast';

const EMPTY_SALE = { sellerId: '', quantity: 1 };

export default function CreamsPage() {
  const { data: creams, mutate, isLoading } = useSWR<Cream[]>(ENDPOINTS.CREAMS.BASE, () => creamService.getAll());
  const { data: artists } = useSWR<User[]>(ENDPOINTS.TEAM.USERS, () => teamService.getUsers());

  const [isCreamModalOpen, setIsCreamModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [selectedCream, setSelectedCream] = useState<Cream | null>(null);
  const [saleForm, setSaleForm] = useState(EMPTY_SALE);
  const [submitting, setSubmitting] = useState(false);

  const openSale = (cream: Cream) => {
    setSelectedCream(cream);
    setSaleForm(EMPTY_SALE);
    setIsSaleModalOpen(true);
  };

  const handleSale = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCream || !saleForm.sellerId) { toast.error('Seleziona un artista'); return; }
    setSubmitting(true);
    try {
      await creamService.registerSale({
        creamId: selectedCream.id,
        sellerId: saleForm.sellerId,
        quantity: saleForm.quantity,
        totalPrice: selectedCream.price * saleForm.quantity,
      });
      toast.success('Vendita registrata');
      mutate();
      setIsSaleModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Errore nella registrazione');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-surface p-6 rounded-[25px] border border-surface-border shadow-xl">
        <div>
          <h1 className="text-3xl font-outfit font-bold text-white">Gestione Inventario</h1>
          <p className="text-text-secondary text-sm">Monitora le scorte e registra le vendite dei prodotti</p>
        </div>
        <button onClick={() => setIsCreamModalOpen(true)} className="btn-primary flex items-center gap-2 px-6">
          <Plus size={20} />
          <span>Aggiungi Prodotto</span>
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? [1, 2, 3].map(i => <div key={i} className="h-64 glass-panel animate-pulse" />)
          : creams?.map(cream => (
            <div key={cream.id} className="glass-panel p-6 flex flex-col justify-between group hover:border-accent/40 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-accent/10 transition-colors">
                  <Package className="text-accent" size={32} />
                </div>
                {cream.stock < 5 && (
                  <div className="flex items-center gap-1 text-danger text-xs font-bold bg-danger/10 px-3 py-1 rounded-full animate-pulse border border-danger/20">
                    <AlertTriangle size={14} /> SCORTA CRITICA
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xl font-bold text-white font-outfit mb-1">{cream.name}</h3>
                <p className="text-text-secondary text-sm mb-4">{cream.brand || 'Nagma Edition'}</p>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-[10px] text-text-secondary uppercase tracking-widest">Prezzo</div>
                    <div className="text-2xl font-bold text-white">€ {cream.price.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-text-secondary uppercase tracking-widest">Giacenza</div>
                    <div className={`text-xl font-bold ${cream.stock < 5 ? 'text-danger' : 'text-success'}`}>{cream.stock} pz</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => openSale(cream)}
                disabled={cream.stock <= 0}
                className={`mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                  cream.stock > 0
                    ? 'bg-accent text-black hover:scale-[1.02] shadow-lg shadow-accent/10'
                    : 'bg-white/5 text-text-secondary cursor-not-allowed border border-surface-border'
                }`}
              >
                <ShoppingCart size={20} />
                {cream.stock > 0 ? 'Registra Vendita' : 'Esaurito'}
              </button>
            </div>
          ))}
      </div>

      {/* Sale modal */}
      {isSaleModalOpen && selectedCream && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-2000 p-4">
          <div className="bg-[#0a0a0a] border border-surface-border rounded-[35px] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-surface-border flex justify-between items-center">
              <h3 className="text-xl font-outfit text-white font-semibold">Vendita: {selectedCream.name}</h3>
              <button onClick={() => setIsSaleModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition">
                <Plus size={24} className="text-text-secondary rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSale} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-text-secondary text-sm px-1">Venduto da (Artista) *</label>
                <select
                  required
                  className="w-full bg-white/5 border border-surface-border rounded-xl p-3 text-white focus:outline-none focus:border-accent appearance-none"
                  value={saleForm.sellerId}
                  onChange={e => setSaleForm(f => ({ ...f, sellerId: e.target.value }))}
                >
                  <option value="" className="bg-[#0a0a0a]">Seleziona artista...</option>
                  {artists?.map(a => (
                    <option key={a.id} value={a.id} className="bg-[#0a0a0a]">{a.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-text-secondary text-sm px-1">Quantità</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedCream.stock}
                    className="w-full bg-white/5 border border-surface-border rounded-xl p-3 text-white"
                    value={saleForm.quantity}
                    onChange={e => setSaleForm(f => ({ ...f, quantity: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-text-secondary text-sm px-1">Subtotale</label>
                  <div className="p-3 bg-white/5 border border-surface-border rounded-xl text-accent font-bold text-lg">
                    € {(selectedCream.price * saleForm.quantity).toFixed(2)}
                  </div>
                </div>
              </div>

              <button type="submit" disabled={submitting} className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-lg">
                {submitting ? <Loader2 className="animate-spin" size={22} /> : <ShoppingCart size={22} />}
                <span>Conferma Vendita</span>
              </button>
            </form>
          </div>
        </div>
      )}

      <CreamModal isOpen={isCreamModalOpen} onClose={() => setIsCreamModalOpen(false)} onSuccess={() => mutate()} />
    </div>
  );
}
