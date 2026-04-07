"use client";

import { useState } from 'react';
import { creamService } from '@/services/cream.service';
import type { CreateCreamData } from '@/types';
import Modal from '@/components/Modal';
import FormInput from '@/components/FormInput';
import SubmitButton from '@/components/SubmitButton';
import toast from 'react-hot-toast';

interface CreamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreamModal({ isOpen, onClose }: CreamModalProps) {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('1');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return toast.error('Nome e Prezzo sono obbligatori');

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
