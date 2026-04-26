"use client";

import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useFormTemplates } from '@/hooks/domain/useFormTemplates';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { useFormTemplateEditor } from './hooks/useFormTemplateEditor';
import TemplateListPanel from './components/TemplateListPanel';
import TemplateEditorPanel from './components/TemplateEditorPanel';

export default function FormTemplatesPage() {
  const theme = useTheme();
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
  }, [user, router]);

  if (!isSuperAdmin) return null;

  const dateInputSx = {
    borderRadius: 1,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: 'rgba(255,255,255,0.05)',
    px: 1.5,
    py: 1,
    fontSize: '0.875rem',
    color: 'white',
    outline: 'none',
    width: '9rem',
    transition: 'border-color 0.2s ease',
    '&:focus': { borderColor: theme.palette.primary.main },
  };

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
        actions={
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                component="input"
                type="date"
                value={startDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                sx={dateInputSx}
              />
              <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                —
              </Box>
              <Box
                component="input"
                type="date"
                value={endDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                sx={dateInputSx}
              />
              {(startDate || endDate) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                  sx={{ fontSize: '0.75rem' }}
                >
                  Reset
                </Button>
              )}
            </Box>
            <Button variant="primary" icon={<Plus />} onClick={handleNewTemplate}>
              Nuovo Template
            </Button>
          </>
        }
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
