"use client";

import useSWR from 'swr';

import { ENDPOINTS } from '@/api/endpoints';
import { teamService } from '@/services/team.service';
import type { Shift, Staff } from '@/types/team';
import type { PaginatedResponse } from '@/types/pagination';

interface MemberHookOptions {
  search?: string;
  type?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

interface HookOptions {
  enabled?: boolean;
}

export function useTeamMembers({
  search,
  type,
  page = 1,
  limit = 20,
  enabled = true,
}: MemberHookOptions = {}) {
  return useSWR<PaginatedResponse<Staff>>(
    enabled ? [ENDPOINTS.TEAM.MEMBERS, search, type, page, limit] : null,
    () => teamService.getMembers({ search, type: type, page, limit }),
    {
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );
}

export function useTeamShifts(weekStart?: string, options?: HookOptions) {
  const enabled = options?.enabled ?? true;

  return useSWR<Shift[]>(
    enabled && weekStart ? [ENDPOINTS.TEAM.SHIFTS, weekStart] : null,
    () => teamService.getShifts(weekStart || ''),
    {
      revalidateOnFocus: true,
      dedupingInterval: 2000,
      refreshInterval: 5 * 60 * 1000, // 5 minuti
    }
  );
}
