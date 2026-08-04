"use client";

import PageContainer from '@/common/components/layout/PageContainer';
import PageHeader from '@/common/components/common/PageHeader';
import StatePanel from '@/common/components/feedback/StatePanel';
import SmartFilters from '@/common/components/common/SmartFilters';
import { useAuth } from '@/common/context/AuthContext';
import { useDeleteConfirm } from '@/common/hooks/useDeleteConfirm';
import ConfirmDialog from '@/common/components/ui/ConfirmDialog';
import { useFormTemplates } from '../hooks/useFormTemplates';
import { useFormTemplateEditor } from '../hooks/useFormTemplateEditor';
import TemplateListPanel from '../components/TemplateListPanel';
import TemplateEditorPanel from '../components/TemplateEditorPanel';
import Icon from '@/common/components/ui/Icon';
import { OkButton } from '@/common/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';

export default function FormTemplatesPage() {
  const { user, isSuperAdmin } = useAuth();
  const router = useRouter();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { data: templates, isLoading, error, mutate } = useFormTemplates({ startDate, endDate });
  const { deleteItem, confirmDialogProps } = useDeleteConfirm();

  const {
    selectedId,
    templateName,
    setTemplateName,
    fields,
    saving,
    isCreating,
    handleSelectTemplate,
    handleNewTemplate,
    handleAddField,
    handleFieldChange,
    handleRemoveField,
    handleCloseEditor,
    handleSave,
    handleDelete,
  } = useFormTemplateEditor({ onMutate: mutate });

  const onRequestDelete = (id: number, name: string) => {
    void deleteItem({
      confirmMessage: `Sei sicuro di voler eliminare il template "${name}"?`,
      action: () => handleDelete(id),
      successMessage: 'Template eliminato.',
      errorMessage: 'Errore durante la cancellazione del template',
      onSuccess: mutate,
    });
  };

  useEffect(() => {
    if (user && !isSuperAdmin) {
      router.push('/');
    }
  }, [user, isSuperAdmin, router]);

  if (!isSuperAdmin) return null;

  if (error) {
    return (
      <StatePanel
        variant="error"
        fullPage
        title="Impossibile caricare i template"
        description="Riprova tra qualche secondo."
        action={<OkButton onClick={() => void mutate()}>Riprova</OkButton>}
      />
    );
  }



  return (
    <PageContainer gap={3} sx={{ overflow: { xs: 'visible', lg: 'hidden' } }}>
      <PageHeader
        title="Template dei form"
        filters={
          <SmartFilters
            dateRange={{
              start: { value: startDate, onChange: setStartDate },
              end: { value: endDate, onChange: setEndDate },
            }}
          />
        }
        showButton
        buttonLabel="Nuovo Template"
        buttonIcon={<Icon name="plus" />}
        onButtonClick={handleNewTemplate}
      />

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: 3,
        }}
      >
        <TemplateListPanel
          templates={templates}
          isLoading={isLoading}
          selectedId={selectedId}
          onSelect={handleSelectTemplate}
          onDelete={onRequestDelete}
        />
        <TemplateEditorPanel
          selectedId={selectedId}
          isCreating={isCreating}
          templateName={templateName}
          fields={fields}
          saving={saving}
          onTemplateNameChange={setTemplateName}
          onAddField={handleAddField}
          onFieldChange={handleFieldChange}
          onRemoveField={handleRemoveField}
          onClose={handleCloseEditor}
          onSave={handleSave}
          onNewTemplate={handleNewTemplate}
        />
      </Box>
      <ConfirmDialog {...confirmDialogProps} />
    </PageContainer>
  );
}
