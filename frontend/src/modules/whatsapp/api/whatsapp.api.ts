import { apiClient } from '@/common/shared/api/client';
import { ENDPOINTS } from '@/common/shared/api/endpoints';
import type { PaginatedResponse } from '@/common/shared/types/pagination';
import type {
  BirthdayCustomer,
  TodayBirthdaysResponse,
  BirthdayGreetingResult,
  BulkBirthdayGreetingResult,
  WhatsAppSessionInfo,
  CreateWhatsAppTemplateData,
  SendWhatsAppMessageData,
  SendWhatsAppMessageResponse,
  WhatsAppMessageLog,
  WhatsAppMessageStatus,
  WhatsAppTemplate,
} from '../model/whatsapp.types';

export const whatsappApi = {
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
    limit = 25,
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
  getTodayBirthdays: async (): Promise<TodayBirthdaysResponse> => {
    return apiClient.get<TodayBirthdaysResponse>(
      ENDPOINTS.WHATSAPP.BIRTHDAYS_TODAY,
    );
  },
  sendBirthdayGreeting: async (customerId: number, resend: boolean): Promise<BirthdayGreetingResult> => {
    return apiClient.post<BirthdayGreetingResult>(ENDPOINTS.WHATSAPP.BIRTHDAYS_SEND, { customerId, resend });
  },
  sendAllBirthdayGreetings: async (): Promise<BulkBirthdayGreetingResult> => {
    return apiClient.post<BulkBirthdayGreetingResult>(ENDPOINTS.WHATSAPP.BIRTHDAYS_SEND, {});
  },
  getConnectionStatus: async () => {
    return apiClient.get<WhatsAppSessionInfo>(
      ENDPOINTS.WHATSAPP.CONNECTION_STATUS
    );
  },
  connect: async () => {
    return apiClient.post<WhatsAppSessionInfo>(
      ENDPOINTS.WHATSAPP.CONNECT,
      {}
    );
  },
  disconnect: async () => {
    return apiClient.post<{ success: boolean; message: string }>(
      ENDPOINTS.WHATSAPP.DISCONNECT,
      {}
    );
  },
};

