"use client";

import { useEffect, useState, useCallback } from 'react';
import { staffApi } from '../api/staff.api';
import type { Shift, Staff } from '../model/staff.types';
import type { PaginatedResponse } from '@/shared/types/pagination';

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
  limit = 20,
  enabled = true,
}: MemberHookOptions = {}) {
  const [data, setData] = useState<PaginatedResponse<Staff> | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    try {
      const res = await staffApi.getMembers({ search, type, page, limit });
      setData(res);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [search, type, page, limit, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, mutate: fetchData };
}

export function useStaffShifts(weekStart?: string, options?: HookOptions) {
  const enabled = options?.enabled ?? true;
  const [data, setData] = useState<Shift[] | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const fetchData = useCallback(async () => {
    if (!enabled || !weekStart) return;
    setIsLoading(true);
    try {
      const res = await staffApi.getShifts(weekStart);
      setData(res);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [weekStart, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, mutate: fetchData };
}
