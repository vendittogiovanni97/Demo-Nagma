"use client";

import dynamic from 'next/dynamic';

import { MessageCircle, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import StatePanel from '@/components/feedback/StatePanel';
import SearchInput from '@/components/forms/SearchInput';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/context/AuthContext';
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm';
import { useWhatsAppTemplates } from '@/hooks/domain/useWhatsApp';
import { whatsappService } from '@/services/whatsapp.service';
import type { WhatsAppTemplate } from '@/types/whatsapp';
import { useTemplateFilters } from './hooks/useTemplateFilters';
import TemplateList from './components/TemplateList';

const WhatsAppTemplateModal = dynamic(
  () => import('./components/WhatsAppTemplateModal'),
  { ssr: false }
);

export default function WhatsAppPage() {
  const theme = useTheme();
  const { isAdmin } = useAuth();
  const canManageTemplates = isAdmin;

  const { templateSearch, startDate, endDate, setTemplateSearch, setStartDate, setEndDate, resetDates } =
    useTemplateFilters();

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

  const handleEditTemplate = (template: WhatsAppTemplate) => {
    setEditingTemplate(template);
    setIsTemplateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsTemplateModalOpen(false);
    setEditingTemplate(null);
  };

  const handleModalSuccess = () => {
    void mutateTemplates();
    setEditingTemplate(null);
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
                onClick={resetDates}
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
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 6,
            }}
          >
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
            <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: 'white' }}>
              Nessun template trovato
            </Typography>
            <Typography
              sx={{
                fontSize: '0.875rem',
                color: 'text.secondary',
                mt: 1,
                textAlign: 'center',
                maxWidth: '26rem',
              }}
            >
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
          <TemplateList
            templates={filteredTemplates}
            onEdit={handleEditTemplate}
            onDelete={handleDeleteTemplate}
          />
        )}
      </Box>

      <WhatsAppTemplateModal
        isOpen={isTemplateModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        template={editingTemplate}
      />
      <ConfirmDialog {...confirmDialogProps} />
    </Box>
  );
}
