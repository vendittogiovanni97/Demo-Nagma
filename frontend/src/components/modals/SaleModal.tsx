"use client";

import { useState } from 'react';
import { EXPORT_FETCH_LIMIT } from '@/config/defaults';
import { creamService } from '@/services/cream.service';
import { useTeamUsers } from '@/hooks/domain';
import { useAuth } from '@/context/AuthContext';
import type { Cream } from '@/types/cream';
import Modal from './Modal';
import FormInput from '../forms/FormInput';
import FormSelect from '../forms/FormSelect';
import SubmitButton from '../forms/SubmitButton';
import { Plus } from 'lucide-react';
import StatePanel from '@/components/feedback/StatePanel';
import { canManageInventory } from '@/utils/permissions';
import { notifyError, notifySuccess } from '@/utils/toast';

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  cream: Cream | null;
  onSuccess: () => void;
}

export default function SaleModal({ isOpen, onClose, cream, onSuccess }: SaleModalProps) {
  const { user } = useAuth();
  const canManage = canManageInventory(user?.role);
  const { data: artistsResult } = useTeamUsers({ page: 1, limit: EXPORT_FETCH_LIMIT, enabled: isOpen });
  const artists = artistsResult?.data;

  const [sellerId, setSellerId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cream || !sellerId) {
      notifyError(new Error('Seleziona un venditore'), 'Seleziona un venditore');
      return;
    }

    setLoading(true);
    try {
      await creamService.registerSale({
        creamId: cream.id,
        sellerId,
        quantity: Number(quantity),
        totalPrice: cream.price * Number(quantity),
      });
      notifySuccess(`Vendita di ${quantity}x "${cream.name}" registrata!`);
      onSuccess();
      setSellerId('');
      setQuantity('1');
      onClose();
    } catch (error: unknown) {
      notifyError(error, 'Errore nella registrazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Vendita: ${cream?.name || ''}`} maxWidth="max-w-md">
      {!canManage ? (
        <StatePanel
          variant="error"
          title="Permessi insufficienti"
          description="Solo admin e segreteria possono registrare vendite di magazzino."
        />
      ) : (
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormSelect
          label="Venduto da (Artista)"
          required
          value={sellerId}
          onChange={setSellerId}
          placeholder="Seleziona artista..."
          options={(artists || []).map((a) => ({
            value: a.id,
            label: a.name,
          }))}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Quantità"
            type="number"
            value={quantity}
            onChange={setQuantity}
            min={1}
            max={cream?.stock}
          />
          <div className="space-y-2">
            <label className="text-text-secondary text-sm px-1">Subtotale</label>
            <div className="p-3 bg-white/5 border border-surface-border rounded-xl text-accent font-bold text-lg">
              € {((cream?.price || 0) * Number(quantity)).toFixed(2)}
            </div>
          </div>
        </div>

        <SubmitButton loading={loading} label="Conferma Vendita" icon={Plus} />
      </form>
      )}
    </Modal>
  );
}
