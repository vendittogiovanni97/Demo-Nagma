"use client";

import dynamic from 'next/dynamic';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import Icon from '@/common/components/ui/Icon';
import { useMemo, useState } from 'react';

import PageHeader from '@/common/components/common/PageHeader';
import StatePanel from '@/common/components/feedback/StatePanel';
import Button from '@/common/components/ui/Button';
import ConfirmDialog from '@/common/components/ui/ConfirmDialog';
import { useAuth } from '@/common/context/AuthContext';
import { useWhatsAppTemplates } from '@/modules/whatsapp/hooks/useWhatsApp';
import { useDeleteConfirm } from '@/common/hooks/useDeleteConfirm';
import { useSWRConfig } from 'swr';
import { TODAY_BIRTHDAYS_KEY } from '@/modules/whatsapp/hooks/useBirthdays';
import { whatsappApi as whatsappService } from '@/modules/whatsapp/api/whatsapp.api';
import type { WhatsAppTemplate } from '@/modules/whatsapp/model/whatsapp.types';
import TodayBirthdaysWidget from '../components/TodayBirthdaysWidget';
import WhatsAppConnectCard from '../components/WhatsAppConnectCard';
import TemplateList from '../components/TemplateList';
import { useTemplateFilters } from '../hooks/useTemplateFilters';

const WhatsAppTemplateModal = dynamic(
  () => import('@/modules/whatsapp/components/modals/WhatsAppTemplateModal'),
  { ssr: false }
);

export default function WhatsAppPage() {
  const theme = useTheme();
  const { isAdmin } = useAuth();
  const canManageTemplates = isAdmin;

  const { templateSearch, startDate, endDate } =
    useTemplateFilters();

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null);

  const { data: templates, mutate: mutateTemplates, isLoading: templatesLoading } =
    useWhatsAppTemplates({ search: templateSearch, startDate, endDate });

  const filteredTemplates = useMemo(() => templates || [], [templates]);

  // Il widget compleanni dipende dall'esistenza del template "Compleanno".
  const { mutate: mutateGlobal } = useSWRConfig();
  const refreshTemplates = () => {
    void mutateTemplates();
    void mutateGlobal(TODAY_BIRTHDAYS_KEY);
  };

  const { deleteItem, confirmDialogProps } = useDeleteConfirm();

  const handleDeleteTemplate = async (templateId: number) => {
    await deleteItem({
      confirmMessage: 'Eliminare questo template?',
      action: () => whatsappService.deleteTemplate(templateId),
      successMessage: 'Template eliminato',
      errorMessage: 'Errore durante l\'eliminazione',
      onSuccess: refreshTemplates,
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
    refreshTemplates();
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
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, width: '100%', maxWidth: '100%', overflow: 'hidden', pt: 3 }}>
      <PageHeader
        title="WhatsApp Templates"
        showButton
        buttonLabel="Nuovo Template"
        buttonIcon={<Icon name="plus" size={16} />}
        onButtonClick={() => {
          setEditingTemplate(null);
          setIsTemplateModalOpen(true);
        }}
      />

      <WhatsAppConnectCard />

      <TodayBirthdaysWidget />

      <Box
        sx={{
          flex: 1,
          borderRadius: 3,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          p: 3,
          position: 'relative',
          backgroundColor: alpha(theme.palette.common.white, 0.03),
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ mb: 3, borderBottom: 1, borderColor: alpha(theme.palette.common.white, 0.08), pb: 2 }}>
          <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: 'common.white' }}>Gestione Template</Typography>
          <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', mt: 0.5 }}>
            {"Crea e modifica i modelli di messaggio pronti da inviare dall'agenda."}
          </Typography>
        </Box>

        {templatesLoading ? (
          <StatePanel variant="loading" fullPage title="Caricamento template..." />
        ) : filteredTemplates.length === 0 ? (
          <StatePanel
            variant="empty"
            title="Nessun template trovato"
            description="Crea il tuo primo template WhatsApp per inviare messaggi rapidi ai clienti direttamente dall'agenda."
            icon={(props: any) => <Icon name="messageCircle" {...props} />}
            action={
              <Button
                variant="primary"
                icon={<Icon name="plus" size={16} />}
                onClick={() => setIsTemplateModalOpen(true)}
                sx={{ mt: 1 }}
              >
                Crea Template
              </Button>
            }
          />
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
