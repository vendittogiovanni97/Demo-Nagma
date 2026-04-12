"use client";

import { useState } from 'react';
import { creamService } from '@/services/cream.service';
import { useAuth } from '@/context/AuthContext';
import StatePanel from '@/components/feedback/StatePanel';
import type { CreateCreamData } from '@/types/cream';
import Modal from './Modal';
import FormInput from '../forms/FormInput';
import SubmitButton from '../forms/SubmitButton';
import { canManageInventory } from '@/utils/permissions';
import { notifyError, notifySuccess } from '@/utils/toast';
import { validateCreamData } from '@/utils/validation';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EMPTY = { name: '', brand: '', price: '', stock: '1' };

export default function CreamModal({ isOpen, onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const canManage = canManageInventory(user?.role);

  const set = <K extends keyof typeof EMPTY>(field: K) =>
    (value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: CreateCreamData = {
      name: form.name,
      brand: form.brand || undefined,
      price: Number(form.price),
      stock: Number(form.stock),
    };
    const validationError = validateCreamData(data);
    if (validationError) {
      notifyError(new Error(validationError), validationError);
      return;
    }

    setLoading(true);
    try {
      await creamService.create(data);
      notifySuccess(`"${form.name}" aggiunto all'inventario!`);
      setForm(EMPTY);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      notifyError(error, 'Errore durante l\'inserimento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuovo Prodotto in Inventario">
      {!canManage ? (
        <StatePanel
          variant="error"
          title="Permessi insufficienti"
          description="Solo admin e segreteria possono aggiungere o modificare prodotti."
        />
      ) : (
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormInput
          label="Nome Prodotto"
          required
          value={form.name}
          onChange={set('name')}
          placeholder="Es. Tattoo Care Cream 50ml"
        />

        <FormInput
          label="Brand"
          value={form.brand}
          onChange={set('brand')}
          placeholder="Brand A, Brand B..."
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Prezzo di Vendita (€)"
            type="number"
            required
            value={form.price}
            onChange={set('price')}
            placeholder="0.00"
            step="0.01"
            min={0}
          />
          <FormInput
            label="Stock Iniziale (Qt.)"
            type="number"
            required
            value={form.stock}
            onChange={set('stock')}
            placeholder="10"
            min={0}
          />
        </div>

        <SubmitButton loading={loading} label="Inserisci Prodotto" />
      </form>
      )}
    </Modal>
  );
}
