"use client";

import { X } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-[2000]">
      <div className="bg-[#0a0a0a] border border-surface-border p-10 rounded-[35px] w-[600px] max-w-[90%] shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-outfit text-white font-semibold">Nuova Prenotazione</h3>
          <button onClick={onClose} className="glass-btn !p-2">
            <X size={24} />
          </button>
        </div>
        
        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-text-secondary">Cliente</label>
            <input 
              type="text" 
              placeholder="Cerca o aggiungi cliente..." 
              className="w-full p-3 rounded-[10px] bg-white/5 border border-surface-border text-white focus:outline-none focus:border-accent transition"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-text-secondary">Data</label>
              <input 
                type="date" 
                className="w-full p-3 rounded-[10px] bg-white/5 border border-surface-border text-white focus:outline-none focus:border-accent transition"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-text-secondary">Ora</label>
              <input 
                type="time" 
                className="w-full p-3 rounded-[10px] bg-white/5 border border-surface-border text-white focus:outline-none focus:border-accent transition"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-text-secondary">Artista</label>
            <select className="w-full p-3 rounded-[10px] bg-white/5 border border-surface-border text-white focus:outline-none focus:border-accent transition appearance-none">
              <option className="bg-[#0a0a0a]">Mario R. (Realistico)</option>
              <option className="bg-[#0a0a0a]">Sofia L. (Tradizionale)</option>
              <option className="bg-[#0a0a0a]">Luca B. (Giapponese)</option>
            </select>
          </div>
          
          <button type="button" className="btn-primary mt-4 w-full" onClick={onClose}>
            Conferma Prenotazione
          </button>
        </form>
      </div>
    </div>
  );
}
