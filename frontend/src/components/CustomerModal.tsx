"use client";

import { useState, useEffect } from 'react';
import { X, User, Phone, Mail, FileText, Save, Loader2 } from 'lucide-react';
import { customerService } from '@/services/customer.service';
import toast from 'react-hot-toast';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customer?: any; // Se presente, siamo in modalità modifica
}

export default function CustomerModal({ isOpen, onClose, onSuccess, customer }: CustomerModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        phone: customer.phone || '',
        email: customer.email || '',
        notes: customer.notes || ''
      });
    } else {
      setFormData({ firstName: '', lastName: '', phone: '', email: '', notes: '' });
    }
  }, [customer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (customer) {
        await customerService.update(customer.id, formData);
        toast.success('Cliente aggiornato');
      } else {
        await customerService.create(formData);
        toast.success('Cliente creato con successo');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Errore durante l\'operazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-[2005] p-4">
      <div className="bg-[#0a0a0a] border border-surface-border rounded-[35px] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 border-b border-surface-border flex justify-between items-center bg-white/[0.02]">
          <h3 className="text-2xl font-outfit text-white font-semibold">
            {customer ? 'Modifica Cliente' : 'Nuovo Cliente'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
            <X size={24} className="text-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-text-secondary text-sm flex items-center gap-2 px-1">
                <User size={14} /> Nome
              </label>
              <input 
                required
                className="w-full bg-white/5 border border-surface-border rounded-xl p-3 text-white focus:outline-none focus:border-accent transition-all"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-text-secondary text-sm flex items-center gap-2 px-1">
                <User size={14} /> Cognome
              </label>
              <input 
                required
                className="w-full bg-white/5 border border-surface-border rounded-xl p-3 text-white focus:outline-none focus:border-accent transition-all"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-text-secondary text-sm flex items-center gap-2 px-1">
              <Phone size={14} /> Telefono
            </label>
            <input 
              required
              className="w-full bg-white/5 border border-surface-border rounded-xl p-3 text-white focus:outline-none focus:border-accent transition-all"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-text-secondary text-sm flex items-center gap-2 px-1">
              <Mail size={14} /> Email (Opzionale)
            </label>
            <input 
              type="email"
              className="w-full bg-white/5 border border-surface-border rounded-xl p-3 text-white focus:outline-none focus:border-accent transition-all"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-text-secondary text-sm flex items-center gap-2 px-1">
              <FileText size={14} /> Note / Allergie / Consensi
            </label>
            <textarea 
              rows={3}
              className="w-full bg-white/5 border border-surface-border rounded-xl p-3 text-white focus:outline-none focus:border-accent transition-all resize-none"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full py-4 flex items-center justify-center gap-2 mt-4 text-lg"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
            <span>{customer ? 'Salva Modifiche' : 'Crea Cliente'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
