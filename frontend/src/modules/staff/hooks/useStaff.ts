"use client";

import useSWR from 'swr';
import { staffApi } from '../api/staff.api';
import type { Shift, Staff } from '../model/staff.types';
import type { PaginatedResponse } from '@/common/shared/types/pagination';

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

export function useStaffMembers({
  search,
  type,
  page = 1,
  limit = 25,
  enabled = true,
}: MemberHookOptions = {}) {
  const key = enabled ? ['/api/staff/members', search, type, page, limit] : null;

  const { data, isLoading, error, mutate } = useSWR<PaginatedResponse<Staff>>(
    key,
    () => staffApi.getMembers({ search, type, page, limit })
  );

  return { data, isLoading, error, mutate };
}

export function useStaffShifts(weekStart?: string, options?: HookOptions) {
  const enabled = (options?.enabled ?? true) && Boolean(weekStart);
  const key = enabled ? ['/api/staff/shifts', weekStart] : null;

  const { data, isLoading, error, mutate } = useSWR<Shift[]>(
    key,
    () => staffApi.getShifts(weekStart!)
  );

  return { data, isLoading, error, mutate };
}

/** Opzioni del selettore artisti per form/select (SWR con chiave dedicata). */
interface StaffForSelectOptions {
  /** Se false la richiesta non parte (es. modale chiusa). */
  enabled?: boolean;
}

export function useStaffForSelect(options: StaffForSelectOptions = {}) {
  const enabled = options.enabled ?? true;
  const key = enabled ? '/api/staff/members/list' : null;

  const { data: rawData = [], isLoading, error } = useSWR<Staff[]>(
    key,
    () => staffApi.getAllForSelect()
  );

  const data = rawData.map((a) => ({
    id: a.id,
    name: a.name,
    color: a.color,
    isRentPayee: a.isRentPayee,
  }));

  return { data, isLoading, error };
}
