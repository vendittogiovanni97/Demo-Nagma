"use client";

import useSWR from 'swr';

import { ENDPOINTS } from '@/api/endpoints';
import { whatsappService } from '@/services/whatsapp.service';
import type { PaginatedResponse } from '@/types/pagination';
import type { WhatsAppMessageLog, WhatsAppMessageStatus, WhatsAppTemplate } from '@/types/whatsapp';

interface UseWhatsAppTemplatesOptions {
  search?: string;
  enabled?: boolean;
  startDate?: string;
  endDate?: string;
}

interface UseWhatsAppLogsOptions {
  search?: string;
  status?: WhatsAppMessageStatus | '';
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export function useWhatsAppTemplates({ search, enabled = true, startDate, endDate }: UseWhatsAppTemplatesOptions = {}) {
  return useSWR<WhatsAppTemplate[]>(
    enabled ? [ENDPOINTS.WHATSAPP.BASE, search, startDate, endDate] : null,
    () => whatsappService.getTemplates(search, startDate, endDate),
    {
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );
}

export function useWhatsAppLogs({
  search,
  status,
  page = 1,
  limit = 20,
  enabled = true,
}: UseWhatsAppLogsOptions = {}) {
  return useSWR<PaginatedResponse<WhatsAppMessageLog>>(
    enabled ? [ENDPOINTS.WHATSAPP.LOGS, search, status, page, limit] : null,
    () => whatsappService.getLogs({ search, status, page, limit }),
    {
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );
}
