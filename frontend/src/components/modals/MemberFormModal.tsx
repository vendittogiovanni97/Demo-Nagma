"use client";

import { useState } from 'react';
import Modal from './Modal';
import FormInput from '../forms/FormInput';
import FormSelect from '../forms/FormSelect';
import SubmitButton from '../forms/SubmitButton';
import StatePanel from '../feedback/StatePanel';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';
import { teamService } from '@/services/team.service';
import type { Staff } from '@/types/team';

const TYPE_OPTIONS = [
  { value: 'COLLABORATORE', label: 'Collaboratore' },
  { value: 'APPRENDISTA', label: 'Apprendista' },
] as const;

type StaffTypeValue = (typeof TYPE_OPTIONS)[number]['value'];

const COLOR_PRESETS = ['#4ec9e0', '#ff6b6b', '#a78bfa', '#34d399', '#fbbf24', '#f87171'];

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  member?: Staff | null;
}

export default function MemberFormModal({ isOpen, onClose, onSuccess, member }: MemberFormModalProps) {
  const toast = useToast();
  const { can } = useAuth();
  const [name, setName] = useState(member?.name || '');
  const [type, setType] = useState<StaffTypeValue>(member?.type || 'COLLABORATORE');
  const [color, setColor] = useState(member?.color || COLOR_PRESETS[0]);
  const [loading, setLoading] = useState(false);

  const isEditing = !!member;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name,
        type,
        color,
      };

      if (isEditing) {
        await teamService.updateMember(member!.id, payload);
        toast.success('Membro modificato');
      } else {
        await teamService.createMember(payload);
        toast.success('Membro creato');
      }
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : (isEditing ? 'Errore durante la modifica' : 'Errore durante la creazione');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!can.manageStaff) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Componente Team" maxWidth="max-w-md">
        <StatePanel
          variant="error"
          title="Permessi insufficienti"
          description="Solo un admin può gestire i componenti del team."
        />
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Modifica Membro' : 'Nuovo Membro'} maxWidth="max-w-md">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormInput
          label="Nome"
          required
          value={name}
          onChange={setName}
          placeholder="Nome del collaboratore..."
        />

        <FormSelect
          label="Ruolo/Tipo"
          value={type}
          onChange={(value) => setType(value as StaffTypeValue)}
          options={TYPE_OPTIONS}
          required
        />

        <div className="space-y-2">
          <label className="text-text-secondary text-sm px-1">Colore</label>
          <div className="flex items-center gap-2 flex-wrap">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setColor(preset)}
                className={`w-10 h-10 rounded-xl border-2 transition-all ${
                  color === preset ? 'border-accent scale-110' : 'border-surface-border'
                }`}
                style={{ backgroundColor: preset }}
                title={preset}
                aria-label={`Seleziona colore ${preset}`}
              />
            ))}
          </div>
        </div>

        <SubmitButton loading={loading} label={isEditing ? 'Salva Modifiche' : 'Crea Membro'} />
      </form>
    </Modal>
  );
}
