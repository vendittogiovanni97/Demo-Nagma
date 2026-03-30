import { X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return toast.error('Nome e Prezzo sono obbligatori');

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/creams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, brand, price: Number(price), stock: Number(stock) })
      });
      if(!res.ok) throw new Error();
      
      toast.success('Prodotto in inventario!');
      setName('');
      setBrand('');
      setPrice('');
      setStock('1');
      onClose();
    } catch (e) {
      toast.error('Errore durante l\'inserimento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-[2000]">
      <div className="bg-[#0a0a0a] border border-surface-border p-10 rounded-[35px] w-[600px] max-w-[90%] shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-outfit text-white font-semibold">Nuovo Prodotto in Inventario</h3>
          <button onClick={onClose} className="glass-btn !p-2" type="button">
            <X size={24} />
          </button>
        </div>
        
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-text-secondary">Nome Prodotto *</label>
            <input 
              required
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Es. Tattoo Care Cream 50ml" 
              className="w-full p-3 rounded-[10px] bg-white/5 border border-surface-border text-white focus:outline-none focus:border-accent transition"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-text-secondary">Brand</label>
            <input 
              type="text" 
              value={brand}
              onChange={e => setBrand(e.target.value)}
              placeholder="Brand A, Brand B..." 
              className="w-full p-3 rounded-[10px] bg-white/5 border border-surface-border text-white focus:outline-none focus:border-accent transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-text-secondary">Prezzo di Vendita (€) *</label>
              <input 
                required
                type="number" 
                step="0.01"
                min="0"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="0.00" 
                className="w-full p-3 rounded-[10px] bg-white/5 border border-surface-border text-white focus:outline-none focus:border-accent transition"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-text-secondary">Stock Iniziale (Qt.)</label>
              <input 
                required
                type="number" 
                min="0"
                value={stock}
                onChange={e => setStock(e.target.value)}
                placeholder="10" 
                className="w-full p-3 rounded-[10px] bg-white/5 border border-surface-border text-white focus:outline-none focus:border-accent transition"
              />
            </div>
          </div>
          
          <button disabled={loading} type="submit" className="btn-primary mt-4 w-full">
            {loading ? 'Salvataggio...' : 'Inserisci Prodotto'}
          </button>
        </form>
      </div>
    </div>
  );
}
