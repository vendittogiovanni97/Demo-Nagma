"use client";

import { useState } from 'react';
import { staffService } from '@/services/staff.service';
import { useAuth } from '@/context/AuthContext';
import StatePanel from '@/components/feedback/StatePanel';
import Modal from './Modal';
import FormInput from '../forms/FormInput';
import FormSelect from '../forms/FormSelect';
import SubmitButton from '../forms/SubmitButton';
import { notifyError, notifySuccess } from '@/utils/toast';
import { validateData } from '@/utils/validation';
import { createStaffSchema } from '@/schemas';

const STAFF_TYPE_OPTIONS = [
  { value: 'COLLABORATORE', label: 'Collaboratore' },
  { value: 'APPRENDISTA', label: 'Apprendista' },
] as const;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function StaffModal({ isOpen, onClose }: Props) {
  const { can } = useAuth();
  const [name, setName] = useState('');
  const [type, setType] = useState('COLLABORATORE');
  const [color, setColor] = useState('#00BFFF');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, type, color };
    const validationError = validateData(createStaffSchema, payload);
    if (validationError) {
      notifyError(new Error(validationError), validationError);
      return;
    }

    setLoading(true);
    try {
      await staffService.create(payload);
      notifySuccess(`${name} aggiunto al team!`);
      setName('');
      setType('COLLABORATORE');
      setColor('#00BFFF');
      onClose();
    } catch (error: unknown) {
      notifyError(error, 'Errore durante l\'inserimento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Aggiungi Staff" maxWidth="max-w-md">
      {!can.manageStaff ? (
        <StatePanel
          variant="error"
          title="Permessi insufficienti"
          description="Solo un admin può creare nuovi membri dello staff."
        />
      ) : (
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormInput
          label="Nome"
          required
          value={name}
          onChange={setName}
          placeholder="Nome del collaboratore..."
        />

        <FormSelect
          label="Tipo"
          value={type}
          onChange={setType}
          options={[...STAFF_TYPE_OPTIONS]}
        />

        <div className="space-y-2">
          <label className="text-text-secondary text-sm px-1">Colore Calendario</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-12 h-12 rounded-xl border border-surface-border cursor-pointer bg-transparent"
            />
            <span className="text-sm text-text-secondary">Usato per distinguere gli appuntamenti in agenda</span>
          </div>
        </div>

        <SubmitButton loading={loading} label="Crea Profilo Staff" />
      </form>
      )}
    </Modal>
  );
}
