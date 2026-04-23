"use client";

import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { spesaLiberaService } from '@/services/spesa-libera.service';
import Button from '@/components/ui/Button';
import MonthPicker from '@/components/ui/MonthPicker';
import { useToast } from '@/hooks/useToast';
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm';
import type { SpesaLibera } from '@/types/spesa-libera';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { formatPrice } from '@/utils/format';
import { extractErrorMessage } from '@/utils/extract-error';
import { Loader2, Plus, Receipt, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import useSWR from 'swr';
import { mutate } from 'swr';

export default function SpeseLiberePage() {
  const toast = useToast();
  const { deleteItem, confirmDialogProps } = useDeleteConfirm();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  const monthStr = format(currentDate, 'yyyy-MM');
  const monthLabel = format(currentDate, 'MMMM yyyy', { locale: it });

  const { data: allSpese, isLoading } = useSWR<SpesaLibera[]>(
    ['spese-libere', monthStr],
    () => spesaLiberaService.getAll(monthStr),
    { revalidateOnFocus: false }
  );

  const spese = allSpese?.filter(s => s.createdAt.startsWith(monthStr)) ?? [];

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;
    const parsed = parseFloat(price);
    if (isNaN(parsed) || parsed < 0) {
      toast.error('Prezzo non valido');
      return;
    }
    setIsAdding(true);
    try {
      await spesaLiberaService.create({ name: name.trim(), price: parsed });
      await mutate(['spese-libere', monthStr]);
      setName('');
      setPrice('');
      nameRef.current?.focus();
      toast.success('Spesa aggiunta');
    } catch (e) {
      toast.error(extractErrorMessage(e, 'Errore nel salvataggio'));
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    await deleteItem({
      confirmMessage: 'Eliminare questa spesa?',
      action: async () => {
        await spesaLiberaService.delete(id);
        await mutate(['spese-libere', monthStr]);
      },
      successMessage: 'Spesa eliminata',
    });
  };

  const total = spese.reduce((acc, s) => acc + s.price, 0);

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-2xl mx-auto w-full pt-8 px-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Receipt size={22} className="text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-outfit text-white">Spese Libere</h1>
            <p className="text-sm text-text-secondary">Annotazioni rapide di spese</p>
          </div>
        </div>
        <MonthPicker value={currentDate} onChange={setCurrentDate} />
      </div>

      <form
        onSubmit={handleAdd}
        className="glass-panel rounded-2xl p-5 flex flex-col sm:flex-row gap-3"
      >
        <input
          ref={nameRef}
          type="text"
          placeholder="Nome spesa"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="flex-1 rounded-xl border border-surface-border bg-white/5 px-4 py-3 text-white placeholder:text-text-secondary outline-none transition focus:border-accent"
        />
        <input
          type="number"
          placeholder="Prezzo €"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          step="0.01"
          min="0"
          required
          className="w-36 rounded-xl border border-surface-border bg-white/5 px-4 py-3 text-white placeholder:text-text-secondary outline-none transition focus:border-accent"
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={isAdding || !name.trim() || !price}
          isLoading={isAdding}
          loadingLabel="Aggiungo..."
          icon={isAdding ? undefined : <Plus size={18} />}
        >
          Aggiungi
        </Button>
      </form>

      <div className="glass-panel rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-text-secondary">
            <Loader2 size={28} className="animate-spin mr-3" />
            <span>Caricamento...</span>
          </div>
        ) : spese.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-text-secondary">
            <Receipt size={40} className="opacity-30" />
            <p className="text-sm">Nessuna spesa per {monthLabel}</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border">
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Nome
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Data
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Prezzo
                  </th>
                  <th className="w-12 px-4 py-4" />
                </tr>
              </thead>
              <tbody>
                {spese.map((spesa, idx) => (
                  <tr
                    key={spesa.id}
                    className={`border-b border-surface-border/50 transition-colors hover:bg-white/5 ${
                      idx === spese.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    <td className="px-6 py-4 text-white font-medium">{spesa.name}</td>
                    <td className="px-6 py-4 text-text-secondary text-sm">
                      {format(new Date(spesa.createdAt), 'd MMM', { locale: it })}
                    </td>
                    <td className="px-6 py-4 text-right text-accent font-semibold tabular-nums">
                      {formatPrice(spesa.price)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(spesa.id)}
                        icon={<Trash2 size={16} />}
                        title="Elimina"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total row */}
            <div className="flex justify-between items-center px-6 py-4 border-t border-surface-border bg-white/3">
              <span className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                Totale {monthLabel}
              </span>
              <span className="text-lg font-bold text-accent tabular-nums">
                {formatPrice(total)}
              </span>
            </div>
          </>
        )}
      </div>

      <ConfirmDialog {...confirmDialogProps} />
    </div>
  );
}
