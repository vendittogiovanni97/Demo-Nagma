"use client";

import dynamic from 'next/dynamic';
import { useState } from 'react';

import Box from '@mui/material/Box';

import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import type { User } from '@/types/team';

import SettingsProfileTab from './components/SettingsProfileTab';
import SettingsTeamTab from './components/SettingsTeamTab';
import { useProfileForm } from './hooks/useProfileForm';
import { useTeamMemberActions } from './hooks/useTeamMemberActions';

const MemberFormModal = dynamic(() => import('./components/MemberFormModal'), { ssr: false });
const ResetPasswordModal = dynamic(() => import('./components/ResetPasswordModal'), { ssr: false });

export default function SettingsPage() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'users'>('profile');

  const profileForm = useProfileForm({ initialName: user?.name || '' });

  const {
    members,
    membersLoading,
    membersError,
    mutateMembers,
    isUserFormOpen,
    setIsUserFormOpen,
    editingUser,
    setEditingUser,
    isResetPasswordOpen,
    setIsResetPasswordOpen,
    resetPasswordUser,
    handleEditUser,
    handleResetPassword,
    handleDeleteMember,
    memberColumns,
    confirmDialogProps,
  } = useTeamMemberActions();

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
      <PageHeader title="Impostazioni" />

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

      {activeTab === 'profile' && (
        <SettingsProfileTab user={user ?? null} form={profileForm} />
      )}

      {activeTab === 'users' && isAdmin && (
        <SettingsTeamTab
          members={members as User[]}
          membersLoading={membersLoading}
          membersError={membersError}
          columns={memberColumns as any}
          onAdd={() => {
            setEditingUser(null);
            setIsUserFormOpen(true);
          }}
          onEdit={handleEditUser}
          onReset={handleResetPassword}
          onDelete={handleDeleteMember}
        />
      )}

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
