"use client";

import useSWR from 'swr';
import { fetcher } from '@/utils/fetcher';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useState } from 'react';
import BookingModal from '@/components/BookingModal';

export default function AgendaPage() {
  const [monthStr, setMonthStr] = useState(() => format(new Date(), 'yyyy-MM'));
  const { data: bookings, isLoading } = useSWR(`/api/bookings?month=${monthStr}`, fetcher);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl tracking-tight text-white font-outfit font-semibold">Agenda Appuntamenti</h1>
        <div className="flex gap-4">
          <input 
            type="month" 
            value={monthStr}
            onChange={e => setMonthStr(e.target.value)}
            className="p-3 rounded-[10px] bg-white/5 border border-surface-border text-white focus:outline-none focus:border-accent transition appearance-none"
          />
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>Nuovo Appuntamento</button>
        </div>
      </div>

      <div className="glass-panel flex-1 p-6 overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-text-secondary">Caricamento appuntamenti...</div>
        ) : (
          <div className="flex flex-col gap-3 overflow-y-auto">
            {(!bookings || bookings.length === 0) ? (
              <div className="text-center text-text-secondary mt-10">Nessun appuntamento per il mese selezionato.</div>
            ) : (
              bookings.map((b: any) => (
                <div key={b.id} className="bg-white/5 border border-surface-border p-4 rounded-xl flex items-center justify-between hover:border-accent transition cursor-pointer">
                  <div className="flex items-center gap-6">
                    <div className="text-center border-r border-surface-border pr-6 min-w-[100px]">
                      <div className="text-accent font-bold text-xl">{format(new Date(b.date), 'dd MMM', { locale: it })}</div>
                      <div className="text-text-secondary">{format(new Date(b.date), 'HH:mm')}</div>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg">{b.customer?.firstName} {b.customer?.lastName}</h4>
                      <div className="text-text-secondary text-sm">
                        {b.type} • {b.duration} min • Artista: {b.artist?.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-3 py-1 rounded-[10px] text-xs font-bold uppercase ${b.status === 'CONFIRMED' ? 'bg-[#00BFFF]/10 text-accent' : 'bg-surface border border-surface-border text-text-secondary'}`}>
                      {b.status}
                    </span>
                    {b.outlookEventId && <span className="text-[10px] text-text-secondary">Sync Outlook OK</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
