"use client";

import { useState } from 'react';
import useSWR from 'swr';
import { creamService } from '@/services/cream.service';
import { ENDPOINTS } from '@/api/endpoints';
import { Package, Plus, ShoppingCart, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/Skeleton';
import PageHeader from '@/components/PageHeader';
import CreamModal from '@/components/CreamModal';
import SaleModal from '@/components/SaleModal';
import type { Cream } from '@/types';

export default function CreamsPage() {
  const { data: creams, mutate: mutateCreams, isLoading: isCreamsLoading } = useSWR<Cream[]>(
    ENDPOINTS.CREAMS.BASE,
    () => creamService.getAll()
  );

  const [isCreamModalOpen, setIsCreamModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [selectedCream, setSelectedCream] = useState<Cream | null>(null);

  return (
    <div className="flex-1 flex flex-col gap-6">
      <PageHeader
        title="Gestione Inventario"
        subtitle="Monitora le scorte e registra le vendite dei prodotti"
        actions={
          <button onClick={() => setIsCreamModalOpen(true)} className="btn-primary flex items-center gap-2 px-6">
            <Plus size={20} />
            <span>Aggiungi Prodotto</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isCreamsLoading ? (
          [1, 2, 3].map(i => <Skeleton key={i} className="h-64" />)
        ) : (
          creams?.map((cream) => (
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
                  <div className="flex flex-col">
                    <span className="text-xs text-text-secondary uppercase tracking-widest">Prezzo</span>
                    <span className="text-2xl font-bold text-white">€ {cream.price.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-xs text-text-secondary uppercase tracking-widest">Giacenza</span>
                    <span className={`text-xl font-bold ${cream.stock < 5 ? 'text-danger' : 'text-success'}`}>{cream.stock} pz</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => { setSelectedCream(cream); setIsSaleModalOpen(true); }}
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
          ))
        )}
      </div>

      <CreamModal
        isOpen={isCreamModalOpen}
        onClose={() => { setIsCreamModalOpen(false); mutateCreams(); }}
      />

      <SaleModal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        cream={selectedCream}
        onSuccess={() => mutateCreams()}
      />
    </div>
  );
}
