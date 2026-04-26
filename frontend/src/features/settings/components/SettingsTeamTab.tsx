"use client";

import { Plus, Edit, KeyRound, Trash2 } from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import Avatar from '@/components/data-display/Avatar';
import DataTable, { type Column } from '@/components/data-display/DataTable';
import StatePanel from '@/components/feedback/StatePanel';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import type { Staff } from '@/types/team';

interface SettingsTeamTabProps {
  members: Staff[];
  membersLoading: boolean;
  membersError: unknown;
  columns: Column<Staff>[];
  onAdd: () => void;
  onEdit: (member: Staff) => void;
  onReset: (member: Staff) => void;
  onDelete: (memberId: number, memberName: string) => void;
}

export default function SettingsTeamTab({
  members,
  membersLoading,
  membersError,
  onAdd,
  onEdit,
  onReset,
  onDelete,
}: SettingsTeamTabProps) {
  const theme = useTheme();

  const memberColumns: Column<Staff>[] = [
    {
      key: 'nome',
      label: 'Nome',
      render: (memberData: Staff) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar name={memberData.name} color={memberData.color} />
          <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>{memberData.name}</Typography>
        </Box>
      ),
    },
    {
      key: 'type',
      label: 'Tipo',
      render: (memberData: Staff) => (
        <Badge variant="info" size="sm">
          {memberData.type}
        </Badge>
      ),
    },
    {
      key: 'phone',
      label: 'Telefono',
      render: () => null,
    },
  ];

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.secondary.main,
        backdropFilter: 'blur(20px)',
        border: 1,
        borderColor: 'divider',
        borderRadius: '30px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          px: 4,
          py: 3,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 700 }}>
            Collaboratori
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Gestisci gli utenti del sistema
          </Typography>
        </Box>
        <Button variant="primary" icon={<Plus size={18} />} onClick={onAdd}>
          Nuovo Utente
        </Button>
      </Box>

      {membersError && (
        <StatePanel
          variant="error"
          fullPage
          title="Impossibile caricare i componenti del team"
          description="Riprova tra qualche secondo."
        />
      )}

      {!membersError && (
        <DataTable<Staff>
          columns={memberColumns}
          data={members}
          isLoading={membersLoading}
          emptyMessage="Nessun componente trovato. Clicca 'Nuovo Utente' per aggiungere il primo collaboratore."
          keyExtractor={(m) => m.id}
          actions={(memberData) => (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, width: '100%' }}>
              <Button
                variant="icon"
                icon={<Edit size={18} />}
                title="Modifica"
                onClick={() => onEdit(memberData)}
              />
              <Button
                variant="icon"
                icon={<KeyRound size={18} />}
                sx={{
                  color: 'rgba(255, 152, 0, 0.6)',
                  '&:hover': { color: 'warning.main', backgroundColor: 'rgba(255, 152, 0, 0.1)' },
                }}
                title="Reset Password"
                onClick={() => onReset(memberData)}
              />
              <Button
                variant="icon"
                icon={<Trash2 size={18} />}
                sx={{
                  color: 'rgba(244, 67, 54, 0.6)',
                  '&:hover': { color: 'error.main', backgroundColor: 'rgba(244, 67, 54, 0.1)' },
                }}
                title="Elimina"
                onClick={() => onDelete(memberData.id, memberData.name)}
              />
            </Box>
          )}
        />
      )}
    </Box>
  );
}
