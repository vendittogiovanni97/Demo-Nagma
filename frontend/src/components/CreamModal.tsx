"use client";

import { useState } from 'react';
import { creamService } from '@/services/cream.service';
import type { CreateCreamData } from '@/types';
import Modal from '@/components/Modal';
import FormInput from '@/components/FormInput';
import SubmitButton from '@/components/SubmitButton';
import toast from 'react-hot-toast';

import { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { creamService } from '@/services/cream.service';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data: CreateCreamData = {
        name,
        brand: brand || undefined,
        price: Number(price),
        stock: Number(stock),
      };
      await creamService.create(data);
      toast.success('Prodotto in inventario!');
      setName('');
      setBrand('');
      setPrice('');
      setStock('1');
      onClose();
    } catch {
      toast.error('Errore durante l\'inserimento');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full p-3 rounded-xl bg-white/5 border border-surface-border text-white focus:outline-none focus:border-accent transition';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuovo Prodotto in Inventario">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormInput
          label="Nome Prodotto *"
          required
          value={name}
          onChange={setName}
          placeholder="Es. Tattoo Care Cream 50ml"
        />

        <FormInput
          label="Brand"
          value={brand}
          onChange={setBrand}
          placeholder="Brand A, Brand B..."
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Prezzo di Vendita (€) *"
            type="number"
            required
            value={price}
            onChange={setPrice}
            placeholder="0.00"
            step="0.01"
            min={0}
          />
          <FormInput
            label="Stock Iniziale (Qt.)"
            type="number"
            required
            value={stock}
            onChange={setStock}
            placeholder="10"
            min={0}
          />
        </div>

        <SubmitButton loading={loading} label="Inserisci Prodotto" />
      </form>
    </Modal>
  );
}
