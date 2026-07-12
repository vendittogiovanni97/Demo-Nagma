"use client";

import Badge from '@/common/components/ui/Badge';
import Button from '@/common/components/ui/Button';
import type { FormTemplate } from '@/modules/form-templates/model/form-template.types';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import Icon from '@/common/components/ui/Icon';

function decodeFieldCount(schemaB64: string): number {
  try {
    return JSON.parse(atob(schemaB64)).length;
  } catch {
    return 0;
  }
}

interface TemplateListPanelProps {
  templates: FormTemplate[] | undefined;
  selectedId: number | null;
  onSelect: (template: FormTemplate) => void;
  onDelete: (id: number, name: string) => void;
}

export default function TemplateListPanel({
  templates,
  selectedId,
  onSelect,
  onDelete,
}: TemplateListPanelProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: 'rgba(26,35,50,0.8)',
        backdropFilter: 'blur(10px)',
        width: { xs: '100%', lg: '33.333%' },
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        p: 2.5,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Box
          component="h2"
          sx={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: 'white',
            fontFamily: 'Outfit, sans-serif',
          }}
        >
          Raccoglitore
        </Box>
        <Box component="p" sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.5 }}>
          Scegli un form da modificare
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          pr: 0.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        {(!templates || templates.length === 0) && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 160,
              textAlign: 'center',
            }}
          >
            <Box sx={{ color: 'rgba(255,255,255,0.2)', mb: 1.5 }}>
              <Icon name="fileText" size={32} />
            </Box>
            <Box
              component="p"
              sx={{ color: 'text.secondary', fontSize: '0.875rem', fontWeight: 600 }}
            >
              Nessun template creato.
            </Box>
          </Box>
        )}

        {templates?.map((t) => {
          const isSelected = selectedId === t.id;
          const fieldCount = decodeFieldCount(t.schemaB64);

          return (
            <Box
              key={t.id}
              onClick={() => onSelect(t)}
              sx={{
                p: 2,
                borderRadius: 2,
                border: 1,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                backgroundColor: isSelected ? 'rgba(0,191,255,0.1)' : 'rgba(255,255,255,0.05)',
                borderColor: isSelected ? 'primary.main' : 'divider',
                boxShadow: isSelected ? '0 0 15px rgba(0,191,255,0.1)' : 'none',
                '&:hover': {
                  backgroundColor: isSelected
                    ? 'rgba(0,191,255,0.1)'
                    : 'rgba(255,255,255,0.1)',
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    flex: 1,
                    minWidth: 0,
                    pr: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      backgroundColor: isSelected ? 'primary.main' : 'transparent',
                      border: 1,
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      color: isSelected ? 'black' : 'white',
                    }}
                  >
                    <Icon name="fileText" size={18} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        fontWeight: 700,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: isSelected ? 'primary.main' : 'white',
                      }}
                    >
                      {t.name}
                    </Box>
                    <Box sx={{ color: 'text.secondary', fontSize: '0.75rem', mt: 0.25 }}>
                      Ultima modifica recente
                    </Box>
                  </Box>
                </Box>
                <Button
                  variant="icon"
                  icon={<Icon name="trash2" size={18} />}
                  sx={{
                    color: 'rgba(244,67,54,0.6)',
                    '&:hover': {
                      color: 'error.main',
                      backgroundColor: 'rgba(244,67,54,0.1)',
                    },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(t.id, t.name);
                  }}
                  title="Elimina"
                />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: 1,
                  borderColor: 'rgba(255,255,255,0.1)',
                  pt: 1.5,
                }}
              >
                <Box
                  component="span"
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'text.secondary',
                  }}
                >
                  Campi
                </Box>
                <Badge variant="secondary" size="xs">
                  {fieldCount}
                </Badge>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
