"use client";

import dynamic from 'next/dynamic';

import { Edit, MessageCircle, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

import StatePanel from '@/components/feedback/StatePanel';
import SearchInput from '@/components/forms/SearchInput';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useWhatsAppTemplates } from '@/hooks/domain/useWhatsApp';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm';
import { whatsappService } from '@/services/whatsapp.service';

const WhatsAppTemplateModal = dynamic(
  () => import('@/components/modals/WhatsAppTemplateModal'),
  { ssr: false }
);
import type { WhatsAppTemplate } from '@/types/whatsapp';

export default function WhatsAppTemplatesPage() {
  const theme = useTheme();
  const { isAdmin } = useAuth();
  const canManageTemplates = isAdmin;

  const [templateSearch, setTemplateSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null);

  const { data: templates, mutate: mutateTemplates, isLoading: templatesLoading } =
    useWhatsAppTemplates({ search: templateSearch, startDate, endDate });

  const filteredTemplates = useMemo(() => templates || [], [templates]);

  const { deleteItem, confirmDialogProps } = useDeleteConfirm();

  const handleDeleteTemplate = async (templateId: number) => {
    await deleteItem({
      confirmMessage: 'Eliminare questo template?',
      action: () => whatsappService.deleteTemplate(templateId),
      successMessage: 'Template eliminato',
      errorMessage: 'Errore durante l\'eliminazione',
      onSuccess: mutateTemplates,
    });
  };

  if (!canManageTemplates) {
    return (
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <PageHeader title="WhatsApp Templates" />
        <StatePanel
          variant="error"
          title="Accesso limitato"
          description="Solo gli amministratori possono gestire i template WhatsApp."
        />
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      <PageHeader
        title="WhatsApp Templates"
        actions={
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => {
              setEditingTemplate(null);
              setIsTemplateModalOpen(true);
            }}
          >
            Nuovo Template
          </Button>
        }
      >
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2, maxWidth: '42rem', margin: '0 auto' }}>
          <Box sx={{ flex: 1 }}>
            <SearchInput
              value={templateSearch}
              onChange={setTemplateSearch}
              placeholder="Cerca template..."
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  '& fieldset': { borderColor: 'divider' },
                  '&:hover fieldset': { borderColor: 'primary.main' },
                  '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                },
                '& .MuiInputBase-input': {
                  fontSize: '0.875rem',
                  color: 'white',
                  py: 1,
                  px: 1.5,
                },
                width: '9rem',
              }}
            />
            <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>—</Typography>
            <TextField
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  '& fieldset': { borderColor: 'divider' },
                  '&:hover fieldset': { borderColor: 'primary.main' },
                  '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                },
                '& .MuiInputBase-input': {
                  fontSize: '0.875rem',
                  color: 'white',
                  py: 1,
                  px: 1.5,
                },
                width: '9rem',
              }}
            />
            {(startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setStartDate(''); setEndDate(''); }}
                sx={{ fontSize: '0.75rem' }}
              >
                Reset
              </Button>
            )}
          </Box>
        </Box>
      </PageHeader>

      <Box
        sx={{
          flex: 1,
          borderRadius: 3,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          p: 3,
          position: 'relative',
          backgroundColor: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(12px)',
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'rgba(255,255,255,0.08)', pb: 2 }}>
          <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>Gestione Template</Typography>
          <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', mt: 0.5 }}>
            {"Crea e modifica i modelli di messaggio pronti da inviare dall'agenda."}
          </Typography>
        </Box>

        {templatesLoading ? (
          <StatePanel variant="loading" fullPage title="Caricamento template..." />
        ) : filteredTemplates.length === 0 ? (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6 }}>
            <Box
              sx={{
                width: '5rem',
                height: '5rem',
                borderRadius: '50%',
                backgroundColor: 'rgba(0,191,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <MessageCircle size={32} style={{ color: theme.palette.primary.main }} />
            </Box>
            <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: 'white' }}>Nessun template trovato</Typography>
            <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', mt: 1, textAlign: 'center', maxWidth: '26rem' }}>
              {"Crea il tuo primo template WhatsApp per inviare messaggi rapidi ai clienti direttamente dall'agenda."}
            </Typography>
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => setIsTemplateModalOpen(true)}
              sx={{ mt: 3 }}
            >
              Crea Template
            </Button>
          </Box>
        ) : (
          <Grid container spacing={2} sx={{ overflowY: 'auto', pb: 2 }}>
            {filteredTemplates.map((template) => (
              <Grid key={template.id} size={{ xs: 12, md: 6, xl: 4 }}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: 1,
                    borderColor: 'divider',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'default',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 1.5 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: 'white', lineHeight: 1.2 }}>{template.name}</Typography>
                      {!template.isActive && (
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'warning.main', mt: 0.5 }}>Inattivo</Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="icon"
                        icon={<Edit size={18} />}
                        title="Modifica"
                        onClick={() => {
                          setEditingTemplate(template);
                          setIsTemplateModalOpen(true);
                        }}
                      />
                      <Button
                        variant="icon"
                        icon={<Trash2 size={18} />}
                        sx={{
                          color: 'error.main',
                          opacity: 0.6,
                          '&:hover': {
                            color: 'error.main',
                            backgroundColor: 'rgba(244,67,54,0.1)',
                          },
                        }}
                        title="Elimina"
                        onClick={() => handleDeleteTemplate(template.id)}
                      />
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      borderRadius: 2,
                      p: 2,
                      flex: 1,
                      fontSize: '0.875rem',
                      color: 'text.secondary',
                      fontStyle: 'italic',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 6,
                      WebkitBoxOrient: 'vertical',
                      mb: 1.5,
                    }}
                  >
                    {template.body}
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', borderTop: 1, borderColor: 'rgba(255,255,255,0.08)', pt: 1.5 }}>
                    <Box sx={{ fontSize: '0.75rem', color: 'text.secondary', display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(template.body.match(/\{\{([^}]+)\}\}/g) || []).map((vars, i) => (
                        <Box
                          key={i}
                          sx={{
                            px: 0.75,
                            py: 0.25,
                            backgroundColor: 'rgba(0,191,255,0.1)',
                            color: 'primary.main',
                            borderRadius: 1,
                          }}
                        >
                          {vars}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <WhatsAppTemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => {
          setIsTemplateModalOpen(false);
          setEditingTemplate(null);
        }}
        onSuccess={() => {
          void mutateTemplates();
          setEditingTemplate(null);
        }}
        template={editingTemplate}
      />
      <ConfirmDialog {...confirmDialogProps} />
    </Box>
  );
}