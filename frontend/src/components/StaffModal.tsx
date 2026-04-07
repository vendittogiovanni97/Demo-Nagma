"use client";

import { useState } from 'react';
import { teamService } from '@/services/team.service';
import Modal from '@/components/Modal';
import FormInput from '@/components/FormInput';
import FormSelect from '@/components/FormSelect';
import SubmitButton from '@/components/SubmitButton';
import toast from 'react-hot-toast';

import { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { teamService } from '@/services/team.service';
import { Role } from '@/types/enums';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function StaffModal({ isOpen, onClose }: StaffModalProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('ARTIST');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role || !email || !password) return toast.error('Nome, Email, Password e Ruolo sono obbligatori');

    setLoading(true);
    try {
      await teamService.createUser({
        name,
        email,
        password,
        role: role as 'ADMIN' | 'USER' | 'ARTIST',
        phone: phone || undefined,
      });
      toast.success('Membro del Team salvato!');
      setName('');
      setRole('ARTIST');
      setPhone('');
      setEmail('');
      setPassword('');
      onClose();
    } catch {
      toast.error('Errore durante l\'inserimento');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full p-3 rounded-xl bg-white/5 border border-surface-border text-white focus:outline-none focus:border-accent transition appearance-none';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Aggiungi Staff" maxWidth="max-w-md">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormInput
          label="Nome *"
          required
          value={name}
          onChange={setName}
          placeholder="Nome del collaboratore..."
        />

        <FormInput
          label="Email *"
          type="email"
          required
          value={email}
          onChange={setEmail}
          placeholder="email@studio.it"
        />

        <FormInput
          label="Password *"
          type="password"
          required
          value={password}
          onChange={setPassword}
          placeholder="Password iniziale..."
        />

        <FormSelect
          label="Ruolo *"
          value={role}
          onChange={setRole}
          options={[
            { value: 'ARTIST', label: 'Tatuatore (Artist)' },
            { value: 'ADMIN', label: 'Admin' },
            { value: 'USER', label: 'Assistente / Segreteria' },
          ]}
        />

        <FormInput
          label="Telefono"
          type="tel"
          value={phone}
          onChange={setPhone}
          placeholder="+39 333..."
        />

        <SubmitButton loading={loading} label="Crea Profilo Staff" />
      </form>
    </Modal>
  );
}
