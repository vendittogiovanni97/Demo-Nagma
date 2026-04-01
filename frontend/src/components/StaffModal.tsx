import { X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StaffModal({ isOpen, onClose }: StaffModalProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('ARTIST');
  const [phone, setPhone] = useState('');
  const [commissionPattern, setCommissionPattern] = useState('50%');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role) return toast.error('Nome e Ruolo sono obbligatori');

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/team/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, role, phone, commissionPattern })
      });
      if(!res.ok) throw new Error();
      
      toast.success('Membro del Team salvato!');
      setName('');
      setRole('ARTIST');
      setPhone('');
      setCommissionPattern('50%');
      onClose();
    } catch (e) {
      toast.error('Errore durante l\'inserimento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-[2000]">
      <div className="bg-[#0a0a0a] border border-surface-border p-10 rounded-[35px] w-[500px] max-w-[90%] shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-outfit text-white font-semibold">Aggiungi Staff</h3>
          <button onClick={onClose} className="glass-btn !p-2" type="button">
            <X size={24} />
          </button>
        </div>
        
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-text-secondary">Nome *</label>
            <input 
              required
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nome del collaboratore..." 
              className="w-full p-3 rounded-[10px] bg-white/5 border border-surface-border text-white focus:outline-none focus:border-accent transition"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-text-secondary">Ruolo *</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full p-3 rounded-[10px] bg-white/5 border border-surface-border text-white focus:outline-none focus:border-accent transition appearance-none"
            >
              <option value="ARTIST" className="text-black">Tatuatore (Artist)</option>
              <option value="MANAGER" className="text-black">Shop Manager</option>
              <option value="ASSISTANT" className="text-black">Assistente / Segreteria</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-text-secondary">Telefono</label>
            <input 
              type="tel" 
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+39 333..." 
              className="w-full p-3 rounded-[10px] bg-white/5 border border-surface-border text-white focus:outline-none focus:border-accent transition"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-text-secondary">Commissione / Contratto (Note)</label>
            <input 
              type="text" 
              value={commissionPattern}
              onChange={e => setCommissionPattern(e.target.value)}
              placeholder="Es. 50% su eseguiti" 
              className="w-full p-3 rounded-[10px] bg-white/5 border border-surface-border text-white focus:outline-none focus:border-accent transition"
            />
          </div>
          
          <button disabled={loading} type="submit" className="btn-primary mt-4 w-full">
            {loading ? 'Salvataggio...' : 'Crea Profilo Staff'}
          </button>
        </form>
      </div>
    </div>
  );
}
