"use client";

import PaginationControls from '@/components/feedback/PaginationControls';
import { Skeleton } from '@/components/feedback/Skeleton';
import CreamModal from '@/components/modals/CreamModal';
import type { ExportFilter } from '@/components/modals/ExportModal';
import ExportModal from '@/components/modals/ExportModal';
import SaleModal from '@/components/modals/SaleModal';
import { DEBOUNCE_SEARCH_DELAY, EXPORT_FETCH_LIMIT } from '@/config/defaults';
import { useAuth } from '@/context/AuthContext';
import { useCreams } from '@/hooks/domain';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { creamService } from '@/services/cream.service';
import type { Cream } from '@/types/cream';
import { canManageInventory } from '@/utils/permissions';
import { notifyError, notifySuccess } from '@/utils/toast';
import { AlertTriangle, Package, Plus, Search, ShoppingCart, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function CreamsPage() {
  const { user } = useAuth();
  const [isCreamModalOpen, setIsCreamModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [selectedCream, setSelectedCream] = useState<Cream | null>(null);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, DEBOUNCE_SEARCH_DELAY);
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
      {/* Header: Title left, Search + Filter center, Actions right */}
      <div className="flex items-center justify-between gap-4">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-outfit font-bold text-white">Gestione Inventario</h1>
        </div>

        {/* Search + Filter - Center */}
        <div className="flex-1 max-w-2xl mx-auto flex gap-3">
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
            className="rounded-xl border border-surface-border bg-white/5 px-4 py-3 text-white outline-none transition focus:border-accent whitespace-nowrap"
          >
            <option value="ALL">Tutte le scorte</option>
            <option value="LOW">Scorta bassa</option>
            <option value="OUT">Esauriti</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <ExportModal
            filenameBase="inventario"
            title="Gestione Inventario"
            rows={filteredCreams}
            columns={[
              { label: 'Prodotto', value: (cream: Cream) => cream.name },
              { label: 'Brand', value: (cream: Cream) => cream.brand || '' },
              { label: 'Prezzo', value: (cream: Cream) => cream.price.toFixed(2) },
              { label: 'Stock', value: (cream: Cream) => cream.stock },
            ]}
            filters={[
              {
                key: 'stock',
                label: 'Stato scorte',
                type: 'select',
                value: stockFilter,
                options: [
                  { label: 'Tutte le scorte', value: 'ALL' },
                  { label: 'Scorta bassa', value: 'LOW' },
                  { label: 'Esauriti', value: 'OUT' },
                ],
                onChange: (v) => { setStockFilter(v as 'ALL' | 'LOW' | 'OUT'); setPage(1); },
              },
            ] satisfies ExportFilter[]}
            filtersLabel={`Stock: ${stockFilter}`}
            resolveRows={async () => {
              const response = await creamService.getAll({
                search: debouncedSearch,
                stockStatus: stockFilter === 'ALL' ? undefined : stockFilter,
                page: 1,
                limit: EXPORT_FETCH_LIMIT,
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
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel flex-1 overflow-hidden rounded-2xl">
        {error ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Impossibile caricare l&apos inventario</h3>
              <p className="text-sm text-text-secondary">Riprova tra qualche secondo.</p>
            </div>
          </div>
        ) : !filteredCreams.length ? (
          <div className="py-20">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {search || stockFilter !== 'ALL' ? 'Nessun prodotto trovato' : 'Nessun prodotto presente'}
              </h3>
              <p className="text-sm text-text-secondary max-w-sm mx-auto">
                {search || stockFilter !== 'ALL'
                  ? 'Prova a modificare i filtri di ricerca.'
                  : 'Clicca "Aggiungi Prodotto" per iniziare.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border">
                  <th className="py-4 px-6 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Prodotto</th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Brand</th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Prezzo</th>
                  <th className="py-4 px-6 text-center text-xs font-bold text-text-secondary uppercase tracking-wider">Giacenza</th>
                  <th className="py-4 px-6 text-center text-xs font-bold text-text-secondary uppercase tracking-wider">Stato</th>
                  <th className="py-4 px-6 text-right text-xs font-bold text-text-secondary uppercase tracking-wider">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {isCreamsLoading ? (
                  [1, 2, 3, 4, 5, 6].map((i) => (
                    <tr key={i} className="border-b border-surface-border/50">
                      <td className="py-4 px-6"><Skeleton variant="text" className="w-32" /></td>
                      <td className="py-4 px-6"><Skeleton variant="text" className="w-24" /></td>
                      <td className="py-4 px-6"><Skeleton variant="text" className="w-16" /></td>
                      <td className="py-4 px-6"><Skeleton variant="text" className="w-12 mx-auto" /></td>
                      <td className="py-4 px-6"><Skeleton variant="rect" className="w-20 mx-auto" /></td>
                      <td className="py-4 px-6"><Skeleton variant="rect" className="w-16 ml-auto" /></td>
                    </tr>
                  ))
                ) : (
                  filteredCreams.map((cream) => (
                    <tr key={cream.id} className="border-b border-surface-border/50 hover:bg-white/2 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/5 rounded-xl group-hover:bg-accent/10 transition-colors shrink-0">
                            <Package className="text-accent" size={20} />
                          </div>
                          <span className="text-white font-semibold">{cream.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-text-secondary text-sm">{cream.brand || 'Nagma Edition'}</td>
                      <td className="py-4 px-6">
                        <span className="text-white font-bold">€ {cream.price.toFixed(2)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center">
                          <span className={`text-lg font-bold ${cream.stock < 5 ? 'text-danger' : 'text-success'}`}>
                            {cream.stock} pz
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center">
                          {cream.stock < 5 ? (
                            <div className="flex items-center gap-1 text-danger text-xs font-bold bg-danger/10 px-3 py-1 rounded-full border border-danger/20">
                              <AlertTriangle size={14} /> SCORTA CRITICA
                            </div>
                          ) : (
                            <span className="text-success text-xs font-bold bg-success/10 px-3 py-1 rounded-full border border-success/20">
                              Disponibile
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {canManage ? (
                            <>
                              <button
                                onClick={() => { setSelectedCream(cream); setIsSaleModalOpen(true); }}
                                disabled={cream.stock <= 0}
                                className="p-2 hover:bg-white/10 rounded-lg text-text-secondary hover:text-accent transition disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Registra Vendita"
                              >
                                <ShoppingCart size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(cream.id, cream.name)}
                                className="p-2 hover:bg-white/10 rounded-lg text-text-secondary hover:text-danger transition"
                                title="Elimina prodotto"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredCreams.length > 0 && (
          <PaginationControls
            page={creamsResult?.page ?? 1}
            totalPages={creamsResult?.totalPages ?? 1}
            total={creamsResult?.total ?? 0}
            label="prodotti"
            onPrev={() => setPage((prev) => Math.max(1, prev - 1))}
            onNext={() => setPage((prev) => Math.min(creamsResult?.totalPages ?? 1, prev + 1))}
          />
        )}
      </div>

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
