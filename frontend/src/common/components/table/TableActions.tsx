'use client';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';

import PermissionGate from '@/common/components/auth/PermissionGate';
import Button from '@/common/components/ui/Button';
import Icon from '@/common/components/ui/Icon';

import type { TableAction } from './DataTable.types';
import { resolveActionColor } from './utils/utils';

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
        const color = resolveActionColor(theme, tone);
        return {
          color,
          '&:hover': { color, backgroundColor: alpha(color, 0.12) },
          '&:focus-visible': { outline: `2px solid ${color}`, outlineOffset: 2 },
        };
      }}
    />
  );
}

export function TableActions({ actions }: { actions: TableAction[] }) {
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
        )
      )}
    </Box>
  );
}
