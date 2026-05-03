"use client";

import Grid from '@mui/material/Grid';

import type { WhatsAppTemplate } from '../model/whatsapp.types';
import TemplateCard from './TemplateCard';

interface TemplateListProps {
  templates: WhatsAppTemplate[];
  onEdit: (t: WhatsAppTemplate) => void;
  onDelete: (id: number) => void;
}

export default function TemplateList({ templates, onEdit, onDelete }: TemplateListProps) {
  return (
    <Grid container spacing={2} sx={{ overflowY: 'auto', pb: 2 }}>
      {templates.map((template) => (
        <Grid key={template.id} size={{ xs: 12, md: 6, xl: 4 }}>
          <TemplateCard template={template} onEdit={onEdit} onDelete={onDelete} />
        </Grid>
      ))}
    </Grid>
  );
}
