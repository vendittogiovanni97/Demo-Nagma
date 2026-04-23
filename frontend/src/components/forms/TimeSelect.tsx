"use client";

import { Clock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Props {
  label?: string;
  value: string; // "HH:mm"
  onChange: (value: string) => void;
  required?: boolean;
  minuteStep?: number;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));

function ScrollPicker({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Scroll selected item into center when opening
  useEffect(() => {
    if (!open || !listRef.current) return;
    const active = listRef.current.querySelector('[data-active="true"]') as HTMLElement | null;
    if (active) {
      active.scrollIntoView({ block: 'center' });
    }
  }, [open]);

  return (
    <div ref={ref} className="relative flex-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full bg-white/5 border border-surface-border rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-accent transition-all text-center font-mono"
      >
        {value || '--'}
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-1 z-[200] w-full bg-[#0d1f2d] border border-surface-border rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          <div
            ref={listRef}
            className="overflow-y-auto"
            style={{ maxHeight: '180px' }}
          >
            {options.map((opt) => (
              <div
                key={opt}
                data-active={opt === value}
                onClick={() => { onChange(opt); setOpen(false); }}
                className={[
                  'px-3 py-2 text-sm font-mono text-center cursor-pointer transition-colors',
                  opt === value
                    ? 'bg-accent text-black font-bold'
                    : 'text-white hover:bg-white/10',
                ].join(' ')}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TimeSelect({ label, value, onChange, required, minuteStep = 15 }: Props) {
  const [hh, mm] = value ? value.split(':') : ['', ''];

  const minutes = Array.from(
    { length: Math.ceil(60 / minuteStep) },
    (_, i) => String(i * minuteStep).padStart(2, '0')
  );

  const handleHour = (h: string) => onChange(`${h}:${mm || '00'}`);
  const handleMinute = (m: string) => onChange(`${hh || '09'}:${m}`);

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm text-text-secondary flex items-center gap-2 px-1">
          <Clock size={13} className="shrink-0" />
          {label}
          {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <div className="flex items-center gap-2">
        <ScrollPicker options={HOURS} value={hh} onChange={handleHour} />
        <span className="text-text-secondary font-bold text-lg">:</span>
        <ScrollPicker options={minutes} value={mm} onChange={handleMinute} />
      </div>
    </div>
  );
}
