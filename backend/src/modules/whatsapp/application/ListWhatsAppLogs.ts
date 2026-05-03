import { IWhatsAppRepository, WhatsAppLogFilters } from '../contracts/IWhatsAppRepository';
import { WhatsAppLog } from '../domain/WhatsAppLog';
import { IPaginatedResponse } from '../../../shared/kernel/interfaces';

export class ListWhatsAppLogs {
  constructor(private whatsappRepository: IWhatsAppRepository) {}

  async execute(filters: WhatsAppLogFilters): Promise<IPaginatedResponse<WhatsAppLog>> {
    return this.whatsappRepository.findAllLogsPaged(filters);
  }
}
