import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { PaginatedResponse } from '@/types/pagination';
import type {
  CreateWhatsAppTemplateData,
  SendWhatsAppMessageData,
  SendWhatsAppMessageResponse,
  WhatsAppMessageLog,
  WhatsAppMessageStatus,
  WhatsAppTemplate,
} from '@/types/whatsapp';

export const whatsappService = {
  getTemplates: async (search?: string, startDate?: string, endDate?: string): Promise<WhatsAppTemplate[]> => {
    return apiClient.get<WhatsAppTemplate[]>(ENDPOINTS.WHATSAPP.BASE, { search, startDate, endDate });
  },
  createTemplate: async (data: CreateWhatsAppTemplateData) => {
    return apiClient.post<WhatsAppTemplate>(ENDPOINTS.WHATSAPP.BASE, data);
  },
  updateTemplate: async (id: number, data: Partial<CreateWhatsAppTemplateData>) => {
    return apiClient.put<WhatsAppTemplate>(ENDPOINTS.WHATSAPP.BY_ID(id), data);
  },
  duplicateTemplate: async (id: number) => {
    return apiClient.post<WhatsAppTemplate>(ENDPOINTS.WHATSAPP.DUPLICATE(id), {});
  },
  deleteTemplate: async (id: number) => {
    return apiClient.delete(ENDPOINTS.WHATSAPP.BY_ID(id));
  },
  sendManualMessage: async (data: SendWhatsAppMessageData): Promise<SendWhatsAppMessageResponse> => {
    return apiClient.post<SendWhatsAppMessageResponse>(ENDPOINTS.WHATSAPP.SEND, data);
  },
  getLogs: async ({
    search,
    status,
    page = 1,
    limit = 20,
  }: {
    search?: string;
    status?: WhatsAppMessageStatus | '';
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<WhatsAppMessageLog>> => {
    return apiClient.get<PaginatedResponse<WhatsAppMessageLog>>(ENDPOINTS.WHATSAPP.LOGS, {
      search,
      status: status || undefined,
      page,
      limit,
    });
  },
};
