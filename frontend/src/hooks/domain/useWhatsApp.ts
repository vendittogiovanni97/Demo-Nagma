"use client";

import useSWR from 'swr';

import { ENDPOINTS } from '@/api/endpoints';
import { whatsappService } from '@/services/whatsapp.service';
import type { PaginatedResponse } from '@/types/pagination';
import type { WhatsAppMessageLog, WhatsAppMessageStatus, WhatsAppTemplate } from '@/types/whatsapp';

interface UseWhatsAppTemplatesOptions {
  search?: string;
  enabled?: boolean;
}

interface UseWhatsAppLogsOptions {
  search?: string;
  status?: WhatsAppMessageStatus | '';
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export function useWhatsAppTemplates({ search, enabled = true }: UseWhatsAppTemplatesOptions = {}) {
  return useSWR<WhatsAppTemplate[]>(
    enabled ? [ENDPOINTS.WHATSAPP.BASE, search] : null,
    () => whatsappService.getTemplates(search)
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
    () => whatsappService.getLogs({ search, status, page, limit })
  );
}
