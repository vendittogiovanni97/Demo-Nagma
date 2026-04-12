"use client";

import useSWR from 'swr';

import { ENDPOINTS } from '@/api/endpoints';
import { teamService } from '@/services/team.service';
import type { Shift, User } from '@/types/team';
import type { PaginatedResponse } from '@/types/pagination';

interface UserHookOptions {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

interface HookOptions {
  enabled?: boolean;
}

export function useTeamUsers({
  search,
  role,
  page = 1,
  limit = 20,
  enabled = true,
}: UserHookOptions = {}) {
  return useSWR<PaginatedResponse<User>>(
    enabled ? [ENDPOINTS.TEAM.USERS, search, role, page, limit] : null,
    () => teamService.getUsers({ search, role, page, limit })
  );
}

export function useTeamShifts(weekStart?: string, options?: HookOptions) {
  const enabled = options?.enabled ?? true;

  return useSWR<Shift[]>(
    enabled && weekStart ? [ENDPOINTS.TEAM.SHIFTS, weekStart] : null,
    () => teamService.getShifts(weekStart || '')
  );
}
