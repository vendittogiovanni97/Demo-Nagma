import { X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomerModal({ isOpen, onClose }: CustomerModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !phone) return toast.error('Nome, Cognome e Telefono sono obbligatori');

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, phone, email, notes })
      });
      if(!res.ok) throw new Error();
      
      toast.success('Cliente aggiunto con successo!');
      setFirstName('');
      setLastName('');
      setPhone('');
      setEmail('');
      setNotes('');
      onClose();
    } catch (e) {
      toast.error('Errore durante il salvataggio del cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-[2000]">
      <div className="bg-[#0a0a0a] border border-surface-border p-10 rounded-[35px] w-[600px] max-w-[90%] shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-outfit text-white font-semibold">Anagrafica Nuovo Cliente</h3>
          <button onClick={onClose} className="glass-btn !p-2" type="button">
            <X size={24} />
          </button>
        </div>
        
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-text-secondary">Nome *</label>
              <input 
                required
                type="text" 
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="Nome..." 
                className="w-full p-3 rounded-[10px] bg-white/5 border border-surface-border text-white focus:outline-none focus:border-accent transition"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-text-secondary">Cognome *</label>
              <input 
                required
                type="text" 
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Cognome..." 
                className="w-full p-3 rounded-[10px] bg-white/5 border border-surface-border text-white focus:outline-none focus:border-accent transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-text-secondary">Telefono *</label>
              <input 
                required
                type="tel" 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+39 333..." 
                className="w-full p-3 rounded-[10px] bg-white/5 border border-surface-border text-white focus:outline-none focus:border-accent transition"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-text-secondary">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="cliente@email.com" 
                className="w-full p-3 rounded-[10px] bg-white/5 border border-surface-border text-white focus:outline-none focus:border-accent transition"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-text-secondary">Note (Allergie, preferenze...)</label>
            <textarea 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Inserisci eventuali note qui..." 
              className="w-full p-3 rounded-[10px] bg-white/5 border border-surface-border text-white focus:outline-none focus:border-accent transition h-24 resize-none"
            />
          </div>
          
          <button disabled={loading} type="submit" className="btn-primary mt-4 w-full">
            {loading ? 'Salvataggio...' : 'Crea Cliente'}
          </button>
        </form>
      </div>
    </div>
  );
}
