"use client";

import dynamic from 'next/dynamic';
import { useState } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Settings } from 'lucide-react';

// Simple decorative avatar with a gear icon for the header
const AvatarIcon = () => (
  <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main', color: 'common.white' }}>
    <Settings size={20} />
  </Avatar>
);

const SettingsIconPanel = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'common.white' }}>
    <Typography variant="caption" sx={{ opacity: 0.9 }}>LIVE</Typography>
  </Box>
);

import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/context/AuthContext';

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
      {/* Rich header con look più carico */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 3,
          borderRadius: 2,
          bgcolor: 'linear-gradient(135deg, rgba(0,112,255,0.25) 0%, rgba(0,0,0,0) 60%)',
          background: 'linear-gradient(135deg, rgba(0,120,255,.25) 0%, rgba(0,0,0,0) 60%)',
          boxShadow: 'inset 0 0 0 1px rgba(0,120,255,.4), 0 6px 18px rgba(0,0,0,.25)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AvatarIcon />
          <Box>
            <Typography variant="h4" sx={{ color: 'common.white', fontWeight: 700 }}>
              Impostazioni
            </Typography>
            <Typography variant="body2" sx={{ color: 'common.white', opacity: 0.9 }}>
              Configura profili e utenti
            </Typography>
          </Box>
        </Box>
        <SettingsIconPanel />
      </Box>

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
