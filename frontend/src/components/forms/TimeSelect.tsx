"use client";

import { Clock } from 'lucide-react';

interface Props {
  label?: string;
  value: string; // "HH:mm"
  onChange: (value: string) => void;
  required?: boolean;
  minuteStep?: number;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));

export default function TimeSelect({ label, value, onChange, required, minuteStep = 15 }: Props) {
  const [hh, mm] = value ? value.split(':') : ['', ''];

  const minutes = Array.from(
    { length: Math.ceil(60 / minuteStep) },
    (_, i) => String(i * minuteStep).padStart(2, '0')
  );

  const handleHour = (h: string) => onChange(`${h}:${mm || '00'}`);
  const handleMinute = (m: string) => onChange(`${hh || '09'}:${m}`);

  const selectClass =
    'flex-1 bg-white/5 border border-surface-border rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-accent transition-all appearance-none text-center font-mono';

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
        <select
          value={hh}
          onChange={(e) => handleHour(e.target.value)}
          required={required}
          className={selectClass}
        >
          <option value="" className="bg-[#0a1a26]">--</option>
          {HOURS.map((h) => (
            <option key={h} value={h} className="bg-[#0a1a26]">{h}</option>
          ))}
        </select>
        <span className="text-text-secondary font-bold text-lg">:</span>
        <select
          value={mm}
          onChange={(e) => handleMinute(e.target.value)}
          required={required}
          className={selectClass}
        >
          <option value="" className="bg-[#0a1a26]">--</option>
          {minutes.map((m) => (
            <option key={m} value={m} className="bg-[#0a1a26]">{m}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
