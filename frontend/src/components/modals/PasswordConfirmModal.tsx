"use client";

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from './Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
  loading?: boolean;
}

export default function PasswordConfirmModal({ isOpen, onClose, onConfirm, loading }: Props) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Password richiesta');
      return;
    }

    try {
      await onConfirm(password);
      setPassword('');
    } catch (err: any) {
      setError(err?.message || 'Password non corretta');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Conferma Modifica">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <p className="text-text-secondary text-sm">
          Inserisci la password per confermare la modifica della prenotazione.
        </p>

        <div className="space-y-2">
          <label className="text-sm text-text-secondary">Password *</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Inserisci password..."
              className="w-full h-12 px-4 rounded-xl bg-white/5 text-white border border-surface-border focus:border-accent focus:outline-none transition-colors pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-accent transition-colors cursor-pointer"
              title={showPassword ? 'Nascondi' : 'Mostra'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-danger text-sm font-medium">{error}</p>
        )}

        <div className="flex gap-3 justify-end pt-4">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Annulla
          </Button>
          <Button variant="primary" type="submit" isLoading={loading}>
            Conferma
          </Button>
        </div>
      </form>
    </Modal>
  );
}
