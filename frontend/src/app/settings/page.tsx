"use client";

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { Edit, KeyRound, Plus, Trash2 } from 'lucide-react';

import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import Avatar from '@/components/data-display/Avatar';
import DataTable, { type Column } from '@/components/data-display/DataTable';
import StatePanel from '@/components/feedback/StatePanel';
import FormInput from '@/components/forms/FormInput';
import SubmitButton from '@/components/forms/SubmitButton';
import PageHeader from '@/components/layout/PageHeader';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/context/AuthContext';
import { useTeamMembers } from '@/hooks/domain/useTeam';
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm';
import { useToast } from '@/hooks/useToast';
import { extractErrorMessage } from '@/utils/extract-error';
import { authService } from '@/services/auth.service';
import { teamService } from '@/services/team.service';
import type { User } from '@/types/team';

const MemberFormModal = dynamic(
  () => import('@/components/modals/MemberFormModal'),
  { ssr: false }
);
const ResetPasswordModal = dynamic(
  () => import('@/components/modals/ResetPasswordModal'),
  { ssr: false }
);

export default function SettingsPage() {
  const theme = useTheme();
  const toast = useToast();
  const { user, isAdmin } = useAuth();
  const { deleteItem, confirmDialogProps } = useDeleteConfirm();

  // Tab state
  const [activeTab, setActiveTab] = useState<'profile' | 'users'>('profile');

  // Profile form state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Members tab state
  const { data: membersResult, isLoading: membersLoading, mutate: mutateMembers, error: membersError } = useTeamMembers({
    page: 1,
    limit: 100,
  });
  const members = membersResult?.data || [];

  // Modal states
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await authService.updateMe({
        name: profileName,
        phone: profilePhone,
      });
      toast.success('Profilo aggiornato');
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, 'Errore durante l\'aggiornamento del profilo'));
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Le password inserite non sono uguali');
      return;
    }

    setPasswordLoading(true);
    try {
      await authService.changePassword({
        currentPassword,
        newPassword,
      });
      toast.success('Password cambiata');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, 'Errore durante il cambio della password'));
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleEditUser = (userData: User) => {
    setEditingUser(userData);
    setIsUserFormOpen(true);
  };

  const handleResetPassword = (userData: User) => {
    setResetPasswordUser(userData);
    setIsResetPasswordOpen(true);
  };

  const handleDeleteMember = async (memberId: number, memberName: string) => {
    await deleteItem({
      confirmMessage: `Rimuovere "${memberName}" dal team?`,
      action: () => teamService.deleteMember(memberId),
      successMessage: `${memberName} rimosso dal team`,
      errorMessage: 'Errore durante l\'eliminazione',
      onSuccess: mutateMembers,
    });
  };

  const memberColumns: Column<(typeof members)[number]>[] = useMemo(() => [
    {
      key: 'nome',
      label: 'Nome',
      render: (memberData: any) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar name={memberData.name} color={memberData.color} />
          <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>{memberData.name}</Typography>
        </Box>
      ),
    },
    {
      key: 'type',
      label: 'Tipo',
      render: (memberData: any) => (
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
  ], []);

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
      <PageHeader title="Impostazioni" />

      {/* Tab Pills */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant={activeTab === 'profile' ? 'secondary' : 'ghost'}
          size="md"
          onClick={() => setActiveTab('profile')}
          sx={activeTab === 'profile' ? { borderColor: 'primary.main', color: 'primary.main' } : undefined}
        >
          Il mio profilo
        </Button>
        {isAdmin && (
          <Button
            variant={activeTab === 'users' ? 'secondary' : 'ghost'}
            size="md"
            onClick={() => setActiveTab('users')}
            sx={activeTab === 'users' ? { borderColor: 'primary.main', color: 'primary.main' } : undefined}
          >
            Gestione utenti
          </Button>
        )}
      </Box>

      {/* TAB 1: Profile */}
      {activeTab === 'profile' && (
        <Box
          sx={{
            backgroundColor: theme.palette.secondary.main,
            backdropFilter: 'blur(20px)',
            border: 1,
            borderColor: 'divider',
            borderRadius: '30px',
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            maxWidth: 800,
          }}
        >
          {/* Avatar Section */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              pb: 4,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Avatar
              name={user?.name}
              size="lg"
              color="#4ec9e0"
              sx={{ transform: 'scale(1.5)' }}
            />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 700 }}>
                {user?.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {user?.email}
              </Typography>
            </Box>
          </Box>

          {/* Update Profile Form */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700 }}>
                Informazioni Personali
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Aggiorna i tuoi dati
              </Typography>
            </Box>

            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <FormInput
                label="Nome"
                value={profileName}
                onChange={setProfileName}
                placeholder="Il tuo nome..."
              />

              <FormInput
                label="Telefono"
                type="tel"
                value={profilePhone}
                onChange={setProfilePhone}
                placeholder="+39 123 456 7890"
              />

              <SubmitButton loading={profileLoading} label="Salva Profilo" />
            </form>
          </Box>

          {/* Change Password Section */}
          <Box
            sx={{
              pt: 4,
              borderTop: 1,
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700 }}>
                Cambia Password
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Aggiorna la tua password di accesso
              </Typography>
            </Box>

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <FormInput
                label="Password Attuale"
                type="password"
                required
                value={currentPassword}
                onChange={setCurrentPassword}
                placeholder="••••••••"
              />

              <FormInput
                label="Nuova Password"
                type="password"
                required
                value={newPassword}
                onChange={setNewPassword}
                placeholder="••••••••"
              />

              <FormInput
                label="Conferma Password"
                type="password"
                required
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="••••••••"
              />

              <SubmitButton loading={passwordLoading} label="Cambia Password" />
            </form>
          </Box>
        </Box>
      )}

      {/* TAB 2: User Management */}
      {activeTab === 'users' && isAdmin && (
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
          {/* Header */}
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
            <Button
              variant="primary"
              icon={<Plus size={18} />}
              onClick={() => {
                setEditingUser(null);
                setIsUserFormOpen(true);
              }}
            >
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
            <DataTable<(typeof members)[number]>
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
                    onClick={() => handleEditUser(memberData as unknown as User)}
                  />
                  <Button
                    variant="icon"
                    icon={<KeyRound size={18} />}
                    sx={{
                      color: 'rgba(255, 152, 0, 0.6)',
                      '&:hover': {
                        color: 'warning.main',
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                      },
                    }}
                    title="Reset Password"
                    onClick={() => handleResetPassword(memberData as unknown as User)}
                  />
                  <Button
                    variant="icon"
                    icon={<Trash2 size={18} />}
                    sx={{
                      color: 'rgba(244, 67, 54, 0.6)',
                      '&:hover': {
                        color: 'error.main',
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                      },
                    }}
                    title="Elimina"
                    onClick={() => handleDeleteMember(memberData.id, memberData.name)}
                  />
                </Box>
              )}
            />
          )}
        </Box>
      )}

      {/* Modals */}
      <MemberFormModal
        isOpen={isUserFormOpen}
        onClose={() => setIsUserFormOpen(false)}
        onSuccess={() => mutateMembers()}
        member={editingUser as any}
      />

      {resetPasswordUser && (
        <ResetPasswordModal
          isOpen={isResetPasswordOpen}
          onClose={() => setIsResetPasswordOpen(false)}
          onSuccess={() => mutateMembers()}
          memberId={resetPasswordUser.id}
          userName={resetPasswordUser.name}
        />
      )}
      <ConfirmDialog {...confirmDialogProps} />
    </Box>
  );
}
