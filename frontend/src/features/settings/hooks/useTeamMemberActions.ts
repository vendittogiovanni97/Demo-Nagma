"use client";

import { useMemo, useState } from 'react';

import { useDeleteConfirm } from '@/hooks/useDeleteConfirm';
import { useTeamMembers } from '@/hooks/domain/useTeam';
import { teamService } from '@/services/team.service';
import type { User } from '@/types/team';
import type { Column } from '@/components/data-display/DataTable';

export function useTeamMemberActions() {
  const { data: membersResult, isLoading: membersLoading, mutate: mutateMembers, error: membersError } = useTeamMembers({
    page: 1,
    limit: 100,
  });
  const members = membersResult?.data || [];

  const { deleteItem, confirmDialogProps } = useDeleteConfirm();

  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);

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
      errorMessage: "Errore durante l'eliminazione",
      onSuccess: mutateMembers,
    });
  };

  const memberColumns: Column<(typeof members)[number]>[] = useMemo(() => [
    { key: 'nome', label: 'Nome' },
    { key: 'type', label: 'Tipo' },
    { key: 'phone', label: 'Telefono' },
  ], []);

  return {
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
  };
}
