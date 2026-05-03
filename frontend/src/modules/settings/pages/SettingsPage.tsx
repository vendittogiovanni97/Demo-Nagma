"use client";

import dynamic from 'next/dynamic';
import { useState } from 'react';

import { Box, Stack, useTheme } from '@mui/material';

import ConfirmDialog from '@/components/ui/ConfirmDialog';
import PageHeader from '@/components/common/PageHeader';
import { useAuth } from '@/context/AuthContext';

import SettingsProfileTab from '../components/SettingsProfileTab';
import SettingsTeamTab from '../components/SettingsTeamTab';
import { useProfileForm } from '../hooks/useProfileForm';
import { useTeamMemberActions } from '../hooks/useTeamMemberActions';

const MemberFormModal = dynamic(() => import('@/modules/team/components/modals/MemberFormModal'), { ssr: false });
const ResetPasswordModal = dynamic(() => import('@/modules/team/components/modals/ResetPasswordModal'), { ssr: false });

type SettingsTab = 'profile' | 'users';

interface TabPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function TabPill({ label, active, onClick }: TabPillProps) {
  const theme = useTheme();
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        flex: 1,
        py: 1.25,
        px: 2,
        border: 'none',
        borderRadius: 999,
        cursor: 'pointer',
        fontFamily: 'Outfit, sans-serif',
        fontSize: '0.875rem',
        fontWeight: 600,
        letterSpacing: '0.02em',
        transition: 'all 0.25s ease',
        backgroundColor: active ? theme.palette.primary.main : 'transparent',
        color: active ? '#0a1a26' : theme.palette.text.secondary,
        boxShadow: active ? '0 4px 14px rgba(0, 191, 255, 0.35)' : 'none',
        '&:hover': {
          color: active ? '#0a1a26' : theme.palette.text.primary,
          backgroundColor: active ? theme.palette.primary.main : 'rgba(255, 255, 255, 0.04)',
        },
      }}
    >
      {label}
    </Box>
  );
}

export default function SettingsPage() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

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
      <PageHeader
        title="Impostazioni"
        subtitle="Configura profilo e team"
      />

      {/* Contenuto centrato */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 880,
          mx: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        {/* Tabs segmentati a pill */}
        {isAdmin && (
          <Stack
            direction="row"
            useFlexGap
            sx={{
              gap: 0.5,
              p: 0.5,
              borderRadius: 999,
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: 1,
              borderColor: 'divider',
              alignSelf: { xs: 'stretch', sm: 'center' },
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            <TabPill
              label="Il mio profilo"
              active={activeTab === 'profile'}
              onClick={() => setActiveTab('profile')}
            />
            <TabPill
              label="Gestione utenti"
              active={activeTab === 'users'}
              onClick={() => setActiveTab('users')}
            />
          </Stack>
        )}

        {activeTab === 'profile' && (
          <SettingsProfileTab user={user ?? null} form={profileForm} />
        )}

        {activeTab === 'users' && isAdmin && (
          <SettingsTeamTab
            members={members}
            membersLoading={membersLoading}
            membersError={membersError}
            columns={memberColumns}
            onAdd={() => {
              setEditingUser(null);
              setIsUserFormOpen(true);
            }}
            onEdit={handleEditUser}
            onReset={handleResetPassword}
            onDelete={handleDeleteMember}
          />
        )}
      </Box>

      <MemberFormModal
        isOpen={isUserFormOpen}
        onClose={() => setIsUserFormOpen(false)}
        onSuccess={() => mutateMembers()}
        member={editingUser}
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
