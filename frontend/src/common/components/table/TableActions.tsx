'use client';

import PermissionGate from '@/common/components/auth/PermissionGate';
import Button from '@/common/components/ui/Button';
import Icon from '@/common/components/ui/Icon';
import Box from '@mui/material/Box';
import { alpha, type Theme } from '@mui/material/styles';

export type TableActionTone =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'whatsapp';

export interface TableAction {
  id: string;
  label: string;
  icon: string;
  onClick: () => void;
  tone?: TableActionTone;
  hidden?: boolean;
  disabled?: boolean;
  loading?: boolean;
  adminOnly?: boolean;
}

interface TableActionsProps {
  actions: TableAction[];
}

function resolveColor(theme: Theme, tone: TableActionTone) {
  switch (tone) {
    case 'primary':
      return theme.palette.primary.main;
    case 'success':
      return theme.palette.success.main;
    case 'warning':
      return theme.palette.warning.main;
    case 'error':
      return theme.palette.error.main;
    case 'whatsapp':
      return theme.palette.custom.whatsapp;
    default:
      return theme.palette.text.secondary;
  }
}

function ActionButton({ action }: { action: TableAction }) {
  const tone = action.tone ?? 'default';

  return (
    <Button
      variant="icon"
      title={action.label}
      aria-label={action.label}
      icon={<Icon name={action.icon} size={18} />}
      onClick={action.onClick}
      disabled={action.disabled}
      isLoading={action.loading}
      sx={(theme) => {
        const color = resolveColor(theme, tone);
        return {
          color,
          '&:hover': {
            color,
            backgroundColor: alpha(color, 0.12),
          },
          '&:focus-visible': {
            outline: `2px solid ${color}`,
            outlineOffset: 2,
          },
        };
      }}
    />
  );
}

export default function TableActions({ actions }: TableActionsProps) {
  const visibleActions = actions.filter((action) => !action.hidden);
  if (visibleActions.length === 0) return null;

  return (
    <Box
      onClick={(event) => event.stopPropagation()}
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}
    >
      {visibleActions.map((action) =>
        action.adminOnly ? (
          <PermissionGate key={action.id} requireAdmin>
            <ActionButton action={action} />
          </PermissionGate>
        ) : (
          <ActionButton key={action.id} action={action} />
        ),
      )}
    </Box>
  );
}
