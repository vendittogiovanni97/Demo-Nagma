"use client";

import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import type { FieldDef } from '@/types/form-template';
import { FileText } from 'lucide-react';

interface Props {
  fields: FieldDef[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

export default function BookingDynamicFieldsSection({ fields, values, onChange }: Props) {
  if (fields.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText size={14} className="text-accent" />
        <span className="text-[11px] font-bold text-accent uppercase tracking-widest">Dettagli tattoo</span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {fields.map((field) => {
          const commonProps = {
            label: field.label,
            value: values[field.name] || '',
            onChange: (val: string) => onChange(field.name, val),
            placeholder: field.label,
            required: field.required,
          };

          if (field.type === 'select') {
            return (
              <FormSelect
                key={field.name}
                {...commonProps}
                options={(field.options || []).map((o) => ({ value: o, label: o }))}
              />
            );
          }

          return (
            <FormInput
              key={field.name}
              {...commonProps}
              type={field.type === 'number' ? 'number' : 'text'}
            />
          );
        })}
      </div>
    </div>
  );
}
