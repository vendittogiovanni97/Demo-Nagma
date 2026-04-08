"use client";

import { useState } from 'react';
import { creamService } from '@/services/cream.service';
import type { CreateCreamData } from '@/types';
import Modal from '@/components/Modal';
import FormInput from '@/components/FormInput';
import SubmitButton from '@/components/SubmitButton';
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

  const set = <K extends keyof typeof EMPTY>(field: K) =>
    (value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data: CreateCreamData = {
        name: form.name,
        brand: form.brand || undefined,
        price: Number(form.price),
        stock: Number(form.stock),
      };
      await creamService.create(data);
      toast.success('Prodotto in inventario!');
      setForm(EMPTY);
      onSuccess();
      onClose();
    } catch {
      toast.error('Errore durante l\'inserimento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuovo Prodotto in Inventario">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormInput
          label="Nome Prodotto *"
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
            label="Prezzo di Vendita (€) *"
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
    </Modal>
  );
}
