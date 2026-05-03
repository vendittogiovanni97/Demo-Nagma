import { WhatsAppTemplate } from '../domain/WhatsAppTemplate';
import { WhatsAppLog, WhatsAppMessageStatus } from '../domain/WhatsAppLog';
import { IPaginatedResponse } from '../../../shared/kernel/interfaces';

export interface WhatsAppTemplateFilters {
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface WhatsAppLogFilters {
  search?: string;
  status?: WhatsAppMessageStatus;
  page?: number;
  limit?: number;
}

export interface IWhatsAppRepository {
  // Templates
  findTemplateById(id: number): Promise<WhatsAppTemplate | null>;
  findAllTemplates(filters: WhatsAppTemplateTemplatesFilters): Promise<WhatsAppTemplate[]>;
  createTemplate(template: WhatsAppTemplate): Promise<WhatsAppTemplate>;
  updateTemplate(id: number, data: Partial<WhatsAppTemplate>): Promise<WhatsAppTemplate>;
  deleteTemplate(id: number): Promise<void>;

  // Logs
  createLog(log: WhatsAppLog): Promise<WhatsAppLog>;
  findAllLogsPaged(filters: WhatsAppLogFilters): Promise<IPaginatedResponse<WhatsAppLog>>;
}

export type WhatsAppTemplateTemplatesFilters = WhatsAppTemplateFilters;
