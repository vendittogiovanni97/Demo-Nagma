"use client";

import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import { PERCENTUALE_OPTIONS } from '@/config/booking-config';
import { Banknote } from 'lucide-react';

interface Props {
  price: string;
  deposit: string;
  percentualeMode: string;
  customPercentuale: string;
  prezzoArtista: number;
  guadagno: number;
  onPriceChange: (value: string) => void;
  onDepositChange: (value: string) => void;
  onPercentualeModeChange: (value: string) => void;
  onCustomPercentualeChange: (value: string) => void;
}

export default function BookingFinancialSection({
  price,
  deposit,
  percentualeMode,
  customPercentuale,
  prezzoArtista,
  guadagno,
  onPriceChange,
  onDepositChange,
  onPercentualeModeChange,
  onCustomPercentualeChange,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Banknote size={14} className="text-accent" />
        <span className="text-[11px] font-bold text-accent uppercase tracking-widest">Economico</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 items-end">
        <FormInput label="Prezzo (€)" type="number" value={price} onChange={onPriceChange} placeholder="0.00" min={0} step="0.01" />
        <FormInput label="Acconto (€)" type="number" value={deposit} onChange={onDepositChange} placeholder="0.00" min={0} step="0.01" />
        <FormSelect
          label="% Artista"
          value={percentualeMode}
          onChange={onPercentualeModeChange}
          options={PERCENTUALE_OPTIONS}
        />
        {percentualeMode === 'custom' ? (
          <FormInput
            label="% libera"
            type="number"
            value={customPercentuale}
            onChange={onCustomPercentualeChange}
            placeholder="35"
            min={0}
            max={100}
          />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col items-center justify-center rounded-xl px-3 py-2.5 bg-orange-500/10 border border-orange-500/20">
              <span className="text-[9px] text-orange-400 font-black uppercase tracking-widest mb-1">Artista</span>
              <span className="text-base font-outfit font-black text-orange-400">€{prezzoArtista.toFixed(2)}</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-xl px-3 py-2.5 bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[9px] text-emerald-400 font-black uppercase tracking-widest mb-1">Studio</span>
              <span className="text-base font-outfit font-black text-emerald-400">€{guadagno.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
