"use client";

import { useState } from 'react';
import { transactionService } from '@/services/transaction.service';
import type { CreateTransactionData, TransactionType } from '@/types';
import Modal from '@/components/Modal';
import FormInput from '@/components/FormInput';
import FormSelect from '@/components/FormSelect';
import SubmitButton from '@/components/SubmitButton';
import toast from 'react-hot-toast';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionModal({ isOpen, onClose }: TransactionModalProps) {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;

    setLoading(true);
    try {
      const data: CreateTransactionData = {
        description: desc,
        amount: Number(amount),
        type,
        category: type === 'INCOME' ? 'Servizi' : 'Forniture',
      };
      await transactionService.create(data);
      setDesc('');
      setAmount('');
      setType('EXPENSE');
      toast.success('Transazione registrata con successo!');
      onClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Errore nel salvare la transazione';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuova Voce Spesa / Entrata">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormInput
          label="Descrizione"
          required
          value={desc}
          onChange={setDesc}
          placeholder="Es. Affitto, Colori, Acconto Cliente..."
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Importo (€)"
            type="number"
            required
            value={amount}
            onChange={setAmount}
            placeholder="0.00"
            step="0.01"
            min={0}
          />
          <FormSelect
            label="Tipo"
            value={type}
            onChange={(v) => setType(v as TransactionType)}
            options={[
              { value: 'EXPENSE', label: 'Spesa (Uscita)' },
              { value: 'INCOME', label: 'Entrata' },
            ]}
          />
        </div>

        <SubmitButton loading={loading} label="Registra Transazione" loadingLabel="Registrazione in corso..." />
      </form>
    </Modal>
  );
}
