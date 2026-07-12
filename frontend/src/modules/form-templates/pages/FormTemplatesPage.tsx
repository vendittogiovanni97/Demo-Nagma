"use client";

import PageHeader from '@/common/components/common/PageHeader';
import SmartFilters from '@/common/components/common/SmartFilters';
import { useAuth } from '@/common/context/AuthContext';
import { useFormTemplates } from '../hooks/useFormTemplates';
import { useFormTemplateEditor } from '../hooks/useFormTemplateEditor';
import TemplateListPanel from '../components/TemplateListPanel';
import TemplateEditorPanel from '../components/TemplateEditorPanel';
import Icon from '@/common/components/ui/Icon';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';

export default function FormTemplatesPage() {
  const { user, isSuperAdmin } = useAuth();
  const router = useRouter();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { data: templates, mutate } = useFormTemplates({ startDate, endDate });

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

  useEffect(() => {
    if (user && !isSuperAdmin) {
      router.push('/');
    }
  }, [user, isSuperAdmin, router]);

  if (!isSuperAdmin) return null;

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
      }}
    >
      <PageHeader
        title="Workspace Template"
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
          selectedId={selectedId}
          onSelect={handleSelectTemplate}
          onDelete={handleDelete}
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
    </Box>
  );
}
