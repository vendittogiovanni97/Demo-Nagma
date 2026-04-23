"use client";

import dynamic from 'next/dynamic';

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
import { useTeamMembers } from '@/hooks/domain';

const MemberFormModal = dynamic(
  () => import('@/components/modals/MemberFormModal'),
  { ssr: false }
);
const ResetPasswordModal = dynamic(
  () => import('@/components/modals/ResetPasswordModal'),
  { ssr: false }
);
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm';
import { useToast } from '@/hooks/useToast';
import { extractErrorMessage } from '@/utils/extract-error';
import { authService } from '@/services/auth.service';
import { teamService } from '@/services/team.service';
import type { User } from '@/types/team';
import { Edit, KeyRound, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function SettingsPage() {
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
        <div className="flex items-center gap-3">
          <Avatar name={memberData.name} color={memberData.color} />
          <span className="font-semibold text-white">{memberData.name}</span>
        </div>
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
    <div className="flex-1 flex flex-col gap-6 w-full">
      <PageHeader title="Impostazioni" />

      {/* Tab Pills */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'profile' ? 'secondary' : 'ghost'}
          size="md"
          onClick={() => setActiveTab('profile')}
          className={activeTab === 'profile' ? 'border-accent text-accent' : ''}
        >
          Il mio profilo
        </Button>
        {isAdmin && (
          <Button
            variant={activeTab === 'users' ? 'secondary' : 'ghost'}
            size="md"
            onClick={() => setActiveTab('users')}
            className={activeTab === 'users' ? 'border-accent text-accent' : ''}
          >
            Gestione utenti
          </Button>
        )}
      </div>

      {/* TAB 1: Profile */}
      {activeTab === 'profile' && (
        <div className="glass-panel rounded-2xl p-8 space-y-8 max-w-2xl">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4 pb-8 border-b border-surface-border">
            <Avatar name={user?.name} size="lg" color="#4ec9e0" className="scale-150" />
            <div className="text-center">
              <h2 className="text-xl font-bold text-white">{user?.name}</h2>
              <p className="text-sm text-text-secondary">{user?.email}</p>
            </div>
          </div>

          {/* Update Profile Form */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Informazioni Personali</h3>
              <p className="text-sm text-text-secondary">Aggiorna i tuoi dati</p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
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
          </div>

          {/* Change Password Section */}
          <div className="pt-8 border-t border-surface-border space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Cambia Password</h3>
              <p className="text-sm text-text-secondary">Aggiorna la tua password di accesso</p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
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
          </div>
        </div>
      )}

      {/* TAB 2: User Management */}
      {activeTab === 'users' && isAdmin && (
        <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-8 py-6 border-b border-surface-border flex items-center justify-between bg-white/[0.02]">
            <div>
              <h2 className="text-2xl font-outfit font-bold text-white">Collaboratori</h2>
              <p className="text-sm text-text-secondary mt-1">Gestisci gli utenti del sistema</p>
            </div>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => {
                setEditingUser(null);
                setIsUserFormOpen(true);
              }}
            >
              Nuovo Utente
            </Button>
          </div>

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
                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity w-full">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditUser(memberData as unknown as User)}
                    icon={<Edit size={16} />}
                    className="p-2"
                    title="Modifica"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleResetPassword(memberData as unknown as User)}
                    icon={<KeyRound size={16} />}
                    className="p-2 text-amber-400 hover:text-amber-300"
                    title="Reset Password"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteMember(memberData.id, memberData.name)}
                    icon={<Trash2 size={16} />}
                    className="p-2"
                    title="Elimina"
                  />
                </div>
              )}
            />
          )}
        </div>
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
    </div>
  );
}
