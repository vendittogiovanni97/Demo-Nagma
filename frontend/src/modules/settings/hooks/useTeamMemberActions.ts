"use client";

import { useMemo, useState } from 'react';

import { useDeleteConfirm } from '@/hooks/useDeleteConfirm';
import { useTeamMembers } from '@/modules/team/hooks/useTeam';
import { teamApi } from '@/modules/team/api/team.api';
import type { Staff as Member } from '@/modules/team/model/team.types';
import type { Column } from '@/components/data-display/DataTable';

export function useTeamMemberActions() {
  const { data: membersResult, isLoading: membersLoading, mutate: mutateMembers, error: membersError } = useTeamMembers({
    page: 1,
    limit: 100,
  });

  const members: Member[] = membersResult?.data ?? [];

  const { deleteItem, confirmDialogProps } = useDeleteConfirm();

  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Member | null>(null);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<Member | null>(null);

  const handleEditUser = (userData: Member) => {
    setEditingUser(userData);
    setIsUserFormOpen(true);
  };

  const handleResetPassword = (userData: Member) => {
    setResetPasswordUser(userData);
    setIsResetPasswordOpen(true);
  };

  const handleDeleteMember = async (memberId: number, memberName: string) => {
    await deleteItem({
      confirmMessage: `Rimuovere "${memberName}" dal team?`,
      action: () => teamApi.deleteMember(memberId),
      successMessage: `${memberName} rimosso dal team`,
      errorMessage: "Errore durante l'eliminazione",
      onSuccess: mutateMembers,
    });
  };

  const memberColumns: Column<Member>[] = useMemo(() => [
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
