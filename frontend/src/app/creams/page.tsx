"use client";

import { useState } from 'react';
import { creamService } from '@/services/cream.service';
import { Package, Plus, ShoppingCart, AlertTriangle, Trash2, Search } from 'lucide-react';
import { Skeleton } from '@/components/feedback/Skeleton';
import ExportButtons from '@/components/feedback/ExportButtons';
import PaginationControls from '@/components/feedback/PaginationControls';
import StatePanel from '@/components/feedback/StatePanel';
import PageHeader from '@/components/layout/PageHeader';
import CreamModal from '@/components/modals/CreamModal';
import SaleModal from '@/components/modals/SaleModal';
import { useAuth } from '@/context/AuthContext';
import { useCreams } from '@/hooks/domain';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { Cream } from '@/types/cream';
import { canManageInventory } from '@/utils/permissions';
import { notifyError, notifySuccess } from '@/utils/toast';

export default function CreamsPage() {
  const { user } = useAuth();
  const [isCreamModalOpen, setIsCreamModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [selectedCream, setSelectedCream] = useState<Cream | null>(null);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 250);
  const canManage = canManageInventory(user?.role);
  const { data: creamsResult, mutate: mutateCreams, isLoading: isCreamsLoading, error } = useCreams({
    search: debouncedSearch,
    stockStatus: stockFilter === 'ALL' ? undefined : stockFilter,
    page,
  });
  const filteredCreams = creamsResult?.data || [];
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Eliminare "${name}" dall'inventario?`)) return;
    try {
      await creamService.delete(id);
      notifySuccess('Prodotto eliminato');
      mutateCreams();
    } catch (err: unknown) {
      notifyError(err, 'Errore durante l\'eliminazione');
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6">
      <PageHeader
        title="Gestione Inventario"
        subtitle="Monitora le scorte e registra le vendite dei prodotti"
        actions={
          <>
            <ExportButtons
              filenameBase="inventario"
              title="Gestione Inventario"
              rows={filteredCreams}
              columns={[
                { label: 'Prodotto', value: (cream: Cream) => cream.name },
                { label: 'Brand', value: (cream: Cream) => cream.brand || '' },
                { label: 'Prezzo', value: (cream: Cream) => cream.price.toFixed(2) },
                { label: 'Stock', value: (cream: Cream) => cream.stock },
              ]}
              filtersLabel={`Ricerca: ${search || 'nessuna'} - Stock: ${stockFilter}`}
              resolveRows={async () => {
                const response = await creamService.getAll({
                  search: debouncedSearch,
                  stockStatus: stockFilter === 'ALL' ? undefined : stockFilter,
                  page: 1,
                  limit: 1000,
                });
                return response.data;
              }}
            />
            {canManage ? (
              <button onClick={() => setIsCreamModalOpen(true)} className="btn-primary flex items-center gap-2 px-6">
                <Plus size={20} />
                <span>Aggiungi Prodotto</span>
              </button>
            ) : null}
          </>
        }
      />

      <div className="glass-panel p-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cerca per nome o brand..."
              className="w-full rounded-xl border border-surface-border bg-white/5 py-3 pl-11 pr-4 text-white outline-none transition focus:border-accent"
            />
          </div>
          <select
            value={stockFilter}
            onChange={(e) => {
              setStockFilter(e.target.value as 'ALL' | 'LOW' | 'OUT');
              setPage(1);
            }}
            className="rounded-xl border border-surface-border bg-white/5 px-4 py-3 text-white outline-none transition focus:border-accent"
          >
            <option value="ALL">Tutte le scorte</option>
            <option value="LOW">Scorta bassa</option>
            <option value="OUT">Esauriti</option>
          </select>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isCreamsLoading ? (
          [1, 2, 3].map(i => <Skeleton key={i} className="h-64" />)
        ) : error ? (
          <div className="col-span-full">
            <StatePanel
              variant="error"
              title="Impossibile caricare l'inventario"
              description="Riprova tra qualche secondo."
            />
          </div>
        ) : !filteredCreams.length ? (
          <div className="col-span-full">
            <StatePanel
              variant="empty"
              title="Nessun prodotto trovato"
              description={search || stockFilter !== 'ALL' ? 'Nessun prodotto corrisponde ai filtri selezionati.' : 'Clicca "Aggiungi Prodotto" per iniziare.'}
            />
          </div>
        ) : (
          filteredCreams.map((cream) => (
            <div key={cream.id} className="glass-panel p-6 flex flex-col justify-between group hover:border-accent/40 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-accent/10 transition-colors">
                  <Package className="text-accent" size={32} />
                </div>
                <div className="flex items-center gap-2">
                  {cream.stock < 5 && (
                  <div className="flex items-center gap-1 text-danger text-xs font-bold bg-danger/10 px-3 py-1 rounded-full animate-pulse border border-danger/20">
                    <AlertTriangle size={14} /> SCORTA CRITICA
                  </div>
                  )}
                  {canManage ? (
                    <button
                      onClick={() => handleDelete(cream.id, cream.name)}
                      className="p-2 text-danger opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger/10 rounded-lg"
                      title="Elimina prodotto"
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : null}
                </div>
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
                onClick={() => { setSelectedCream(cream); setIsSaleModalOpen(true); }}
                disabled={cream.stock <= 0 || !canManage}
                className={`mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                  cream.stock > 0 && canManage
                  ? 'bg-accent text-black hover:scale-[1.02] shadow-lg shadow-accent/10'
                  : 'bg-white/5 text-text-secondary cursor-not-allowed border border-surface-border'
                }`}
              >
                <ShoppingCart size={20} />
                {canManage ? (cream.stock > 0 ? 'Registra Vendita' : 'Esaurito') : 'Permessi insufficienti'}
              </button>
            </div>
          ))
        )}
      </div>
      <PaginationControls
        page={creamsResult?.page ?? 1}
        totalPages={creamsResult?.totalPages ?? 1}
        total={creamsResult?.total ?? 0}
        label="prodotti"
        onPrev={() => setPage((prev) => Math.max(1, prev - 1))}
        onNext={() => setPage((prev) => Math.min(creamsResult?.totalPages ?? 1, prev + 1))}
      />

      <CreamModal
        isOpen={isCreamModalOpen}
        onClose={() => setIsCreamModalOpen(false)}
        onSuccess={() => mutateCreams()}
      />

      <SaleModal
        isOpen={isSaleModalOpen}
        onClose={() => { setIsSaleModalOpen(false); setSelectedCream(null); }}
        cream={selectedCream}
        onSuccess={() => mutateCreams()}
      />
    </div>
  );
}
