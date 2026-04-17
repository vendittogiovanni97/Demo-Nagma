"use client";

import { useState } from 'react';
import Button from '@/components/ui/Button';

type FieldDef = {
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox';
  name: string;
  label: string;
  required?: boolean;
  options?: string[]; // Per le select
};

interface DynamicFormProps {
  base64Schema: string;
  onSubmit: (data: Record<string, string | number | boolean>) => void;
  submitLabel?: string;
}

export default function DynamicForm({ base64Schema, onSubmit, submitLabel = 'Salva Modulo' }: DynamicFormProps) {
  const [formData, setFormData] = useState<Record<string, string | number | boolean>>({});

  let fields: FieldDef[] = [];
  try {
    const jsonStr = atob(base64Schema);
    fields = JSON.parse(jsonStr);
  } catch {
    return <div className="text-danger p-4 border border-danger/20 rounded bg-danger/5">Errore decodifica Base64 Schema Form</div>;
  }

  const handleChange = (name: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-sm p-4 bg-white/5 border border-surface-border rounded-xl">
      {fields.map((field, idx) => (
        <div key={`${field.name}-${idx}`} className="flex flex-col gap-2">
          <label className="text-text-secondary font-semibold">
            {field.label} {field.required && <span className="text-danger">*</span>}
          </label>
          
          {field.type === 'text' && (
            <input 
              type="text" 
              required={field.required}
              onChange={e => handleChange(field.name, e.target.value)}
              className="p-3 rounded-[10px] bg-[#0a0a0a] border border-surface-border text-white focus:border-accent outline-none" 
            />
          )}

          {field.type === 'date' && (
             <input 
               type="date" 
               required={field.required}
               onChange={e => handleChange(field.name, e.target.value)}
               className="p-3 rounded-[10px] bg-[#0a0a0a] border border-surface-border text-white focus:border-accent outline-none appearance-none" 
             />
          )}

          {field.type === 'select' && (
             <select 
               required={field.required}
               onChange={e => handleChange(field.name, e.target.value)}
               className="p-3 rounded-[10px] bg-[#0a0a0a] border border-surface-border text-white focus:border-accent outline-none appearance-none"
             >
               <option value="">Seleziona...</option>
               {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
             </select>
          )}

          {field.type === 'number' && (
            <input
              type="number"
              required={field.required}
              onChange={e => handleChange(field.name, Number(e.target.value))}
              className="p-3 rounded-[10px] bg-[#0a0a0a] border border-surface-border text-white focus:border-accent outline-none"
            />
          )}

          {field.type === 'checkbox' && (
             <label className="flex items-center gap-3 cursor-pointer">
               <input 
                 type="checkbox" 
                 required={field.required}
                 onChange={e => handleChange(field.name, e.target.checked)}
                 className="w-5 h-5 rounded accent-accent" 
               />
               <span className="text-white">Confermo</span>
             </label>
          )}
        </div>
      ))}
      <Button type="submit" variant="primary" fullWidth>{submitLabel}</Button>
    </form>
  );
}
