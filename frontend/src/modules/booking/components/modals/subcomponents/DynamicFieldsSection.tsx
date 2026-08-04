"use client";

import FormInput from '@/common/components/forms/FormInput';
import FormSelect from '@/common/components/forms/FormSelect';
import { Box, Grid } from '@mui/material';

interface DynamicFieldConfig {
  name: string;
  label: string;
  type: string;
  options?: string[];
}

interface DynamicFieldsSectionProps {
  templates: Array<{ id: number; name: string }> | null;
  selectedTemplateId: number | null;
  dynamicFields: DynamicFieldConfig[];
  dynamicValues: Record<string, any>;
  onSelectTemplate: (templateId: number) => void;
  onChangeDynamicValues: (values: Record<string, any>) => void;
}

export function DynamicFieldsSection({
  templates,
  selectedTemplateId,
  dynamicFields,
  dynamicValues,
  onSelectTemplate,
  onChangeDynamicValues,
}: DynamicFieldsSectionProps) {
  if (!dynamicFields || dynamicFields.length === 0) return null;

  return (
    <Grid size={12}>
      {templates && templates.length > 1 && (
        <Box sx={{ mb: 1, maxWidth: 200 }}>
          <FormSelect
            label="Template"
            value={selectedTemplateId ?? ''}
            onChange={(v) => onSelectTemplate(Number(v))}
            options={templates.map((t) => ({ value: t.id.toString(), label: t.name }))}
            size="small"
          />
        </Box>
      )}
      <Grid container spacing={2}>
        {dynamicFields.map((f) => (
          <Grid key={f.name} size={{ xs: 12, sm: 3 }}>
            {f.type === 'select' ? (
              <FormSelect
                label={f.label}
                value={dynamicValues[f.name] || ''}
                onChange={(v) => onChangeDynamicValues({ ...dynamicValues, [f.name]: v })}
                options={(f.options || []).map((o) => ({ value: o, label: o }))}
                size="small"
                placeholder="Seleziona..."
              />
            ) : (
              <FormInput
                label={f.label}
                value={dynamicValues[f.name] || ''}
                onChange={(v) => onChangeDynamicValues({ ...dynamicValues, [f.name]: v })}
                type={f.type === 'number' ? 'number' : 'text'}
                size="sm"
                placeholder={f.label}
              />
            )}
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
}
