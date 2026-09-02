'use client';

import Badge from '@/common/components/ui/Badge';
import { DeleteButton } from '@/common/components/ui/Button';
import Icon from '@/common/components/ui/Icon';
import type { FormTemplate } from '@/modules/form-templates/model/form-template.types';
import { decodeFields } from '@/common/shared/utils/formSchema';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

function decodeFieldCount(schemaB64: string): number {
  return decodeFields(schemaB64).length;
}

interface TemplateListPanelProps {
  templates: FormTemplate[] | undefined;
  isLoading: boolean;
  selectedId: number | null;
  onSelect: (template: FormTemplate) => void;
  onDelete: (id: number, name: string) => void;
}

export default function TemplateListPanel({
  templates,
  isLoading,
  selectedId,
  onSelect,
  onDelete,
}: TemplateListPanelProps) {
  return (
    <Box
      component="aside"
      sx={(theme) => ({
        width: { xs: '100%', lg: 'clamp(300px, 27vw, 380px)' },
        maxHeight: { xs: 360, lg: 'none' },
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.paper,
        border: '1px solid',
        borderColor: theme.palette.divider,
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: `0 12px 32px ${alpha(
          theme.palette.common.black,
          theme.palette.mode === 'light' ? 0.04 : 0.15,
        )}`,
      })}
    >
      <Box sx={{ px: 2.5, py: 2.25, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography component="h2" sx={{ fontSize: '1rem', fontWeight: 800, color: 'text.primary' }}>
              I tuoi template
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', mt: 0.25 }}>
              Seleziona un form da configurare
            </Typography>
          </Box>
          <Badge variant="secondary" size="xs">
            {templates?.length ?? 0}
          </Badge>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          p: 1.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {isLoading
          ? Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} variant="rounded" height={72} sx={{ borderRadius: 2.5 }} />
            ))
          : null}

        {!isLoading && (!templates || templates.length === 0) ? (
          <Box
            sx={{
              minHeight: 180,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              p: 3,
              textAlign: 'center',
            }}
          >
            <Box sx={{ color: 'text.disabled', display: 'inline-flex' }}>
              <Icon name="fileText" size={30} />
            </Box>
            <Typography sx={{ color: 'text.primary', fontSize: '0.875rem', fontWeight: 700 }}>
              Nessun template disponibile
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
              Creane uno nuovo per iniziare.
            </Typography>
          </Box>
        ) : null}

        {templates?.map((template) => {
          const isSelected = selectedId === template.id;
          const fieldCount = decodeFieldCount(template.schemaB64);

          return (
            <Box
              key={template.id}
              component="div"
              role="button"
              tabIndex={0}
              onClick={() => onSelect(template)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelect(template);
                }
              }}
              aria-pressed={isSelected}
              sx={(theme) => ({
                width: '100%',
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                textAlign: 'left',
                color: 'inherit',
                cursor: 'pointer',
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: isSelected ? theme.palette.primary.main : theme.palette.divider,
                backgroundColor: isSelected
                  ? alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.1 : 0.14)
                  : 'transparent',
                transition: 'background-color 0.2s ease, border-color 0.2s ease',
                '&:hover': {
                  borderColor: alpha(theme.palette.primary.main, 0.55),
                  backgroundColor: alpha(theme.palette.primary.main, isSelected ? 0.14 : 0.06),
                },
                '&:focus-visible': {
                  outline: `2px solid ${theme.palette.primary.main}`,
                  outlineOffset: 2,
                },
              })}
            >
              <Box
                sx={(theme) => ({
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                  color: isSelected ? theme.palette.primary.contrastText : theme.palette.primary.main,
                  backgroundColor: isSelected
                    ? theme.palette.primary.main
                    : alpha(theme.palette.primary.main, 0.1),
                })}
              >
                <Icon name="fileText" size={18} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 750,
                    color: isSelected ? 'primary.main' : 'text.primary',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {template.name}
                </Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.72rem', mt: 0.2 }}>
                  {fieldCount} {fieldCount === 1 ? 'campo configurato' : 'campi configurati'}
                </Typography>
              </Box>
              <DeleteButton
                variant="icon"
                icon={<Icon name="trash2" size={17} />}
                title={`Elimina ${template.name}`}
                aria-label={`Elimina ${template.name}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(template.id, template.name);
                }}
                sx={(theme) => ({
                  color: theme.palette.error.main,
                  flexShrink: 0,
                  '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.1) },
                })}
              />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
