"use client";

import FormSelect from '@/components/forms/FormSelect';
import { Users } from 'lucide-react';

interface CustomerOption { value: string; label: string; }
interface ArtistOption { value: string; label: string; }

interface Props {
  date: string;
  time: string;
  customerId: string;
  artistId: string;
  loadingArtists: boolean;
  customerOptions: CustomerOption[];
  artistOptions: ArtistOption[];
  noArtistAvailable: boolean;
  onCustomerChange: (value: string) => void;
  onArtistChange: (value: string) => void;
}

export default function BookingParticipantsSection({
  date,
  time,
  customerId,
  artistId,
  loadingArtists,
  customerOptions,
  artistOptions,
  noArtistAvailable,
  onCustomerChange,
  onArtistChange,
}: Props) {
  const hasDateTime = Boolean(date && time);

  return (
    <div className={`space-y-4 transition-all duration-300 ${!hasDateTime ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="flex items-center gap-2">
        <Users size={14} className="text-accent" />
        <span className="text-[11px] font-bold text-accent uppercase tracking-widest">Chi coinvolge</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormSelect
          label="Cliente *"
          value={customerId}
          onChange={onCustomerChange}
          placeholder="Seleziona..."
          required
          options={customerOptions}
        />
        <FormSelect
          label="Artista *"
          value={artistId}
          onChange={onArtistChange}
          disabled={loadingArtists || artistOptions.length === 0}
          placeholder={loadingArtists ? 'Ricerca...' : artistOptions.length === 0 ? 'Nessun artista' : 'Seleziona...'}
          required
          options={artistOptions}
        />
      </div>
      {hasDateTime && noArtistAvailable && !loadingArtists && (
        <p className="text-[11px] text-danger/80 italic">
          Nessun artista disponibile in questo orario.
        </p>
      )}
    </div>
  );
}
