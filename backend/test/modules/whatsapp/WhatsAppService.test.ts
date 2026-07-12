import { AppError } from '../../../src/core/shared/errors/AppError';

const createMockPrisma = () => ({
  whatsAppTemplate: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  whatsAppMessageLog: {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
  },
  $transaction: jest.fn(),
  $connect: jest.fn(),
  $disconnect: jest.fn(),
});

jest.mock('../../../src/core/shared/utils/prisma', () => ({
  __esModule: true,
  default: createMockPrisma(),
}));

import prisma from '../../../src/core/shared/utils/prisma';
import { WhatsAppService } from '../../../src/modules/whatsapp/services/whatsappService';

const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;

describe('WhatsAppService', () => {
  let service: WhatsAppService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new WhatsAppService();
  });

  describe('getAllTemplates', () => {
    it('should return templates with search filter', async () => {
      mockPrisma.whatsAppTemplate.findMany.mockResolvedValue([{ id: 1, name: 'Welcome' }]);
      const result = await service.getAllTemplates({ search: 'Welcome' });
      expect(result).toHaveLength(1);
    });

    it('should filter by date range', async () => {
      mockPrisma.whatsAppTemplate.findMany.mockResolvedValue([]);
      await service.getAllTemplates({ startDate: '2026-07-01', endDate: '2026-07-31' });
      expect(mockPrisma.whatsAppTemplate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ createdAt: expect.any(Object) }) })
      );
    });
  });

  describe('getLogs', () => {
    it('should return paginated logs', async () => {
      mockPrisma.whatsAppMessageLog.findMany.mockResolvedValue([{ id: 1, message: 'Ciao' }]);
      mockPrisma.whatsAppMessageLog.count.mockResolvedValue(1);
      mockPrisma.$transaction.mockImplementation((arr: any[]) => Promise.all(arr));

      const result = await service.getLogs({ page: '1', limit: '20' });
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should filter by status', async () => {
      mockPrisma.whatsAppMessageLog.findMany.mockResolvedValue([]);
      mockPrisma.whatsAppMessageLog.count.mockResolvedValue(0);
      mockPrisma.$transaction.mockImplementation((arr: any[]) => Promise.all(arr));

      await service.getLogs({ status: 'MANUAL_SENT' });
      expect(mockPrisma.whatsAppMessageLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ status: 'MANUAL_SENT' }) })
      );
    });
  });

  describe('createTemplate', () => {
    it('should create template with defaults', async () => {
      mockPrisma.whatsAppTemplate.create.mockResolvedValue({ id: 1, name: 'Test', isActive: true });

      const result = await service.createTemplate({ name: 'Test', body: 'Ciao {{name}}' });

      expect(result.isActive).toBe(true);
      expect(mockPrisma.whatsAppTemplate.create).toHaveBeenCalledWith({
        data: { name: 'Test', category: null, body: 'Ciao {{name}}', isActive: true },
      });
    });
  });

  describe('updateTemplate', () => {
    it('should update existing template', async () => {
      mockPrisma.whatsAppTemplate.findUnique.mockResolvedValue({ id: 1, name: 'Old' });
      mockPrisma.whatsAppTemplate.update.mockResolvedValue({ id: 1, name: 'New' });

      const result = await service.updateTemplate(1, { name: 'New' });
      expect(result.name).toBe('New');
    });

    it('should throw when template not found', async () => {
      mockPrisma.whatsAppTemplate.findUnique.mockResolvedValue(null);

      await expect(service.updateTemplate(999, {}))
        .rejects.toThrow(new AppError('Template non trovato', 404, 'WHATSAPP_TEMPLATE_NOT_FOUND'));
    });
  });

  describe('deleteTemplate', () => {
    it('should soft-delete template', async () => {
      mockPrisma.whatsAppTemplate.findUnique.mockResolvedValue({ id: 1, name: 'Test' });

      await service.deleteTemplate(1);

      expect(mockPrisma.whatsAppTemplate.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { deletedAt: expect.any(Date), isActive: false },
      });
    });

    it('should throw when template not found', async () => {
      mockPrisma.whatsAppTemplate.findUnique.mockResolvedValue(null);

      await expect(service.deleteTemplate(999))
        .rejects.toThrow(new AppError('Template non trovato', 404, 'WHATSAPP_TEMPLATE_NOT_FOUND'));
    });
  });

  describe('duplicateTemplate', () => {
    it('should create a copy of existing template', async () => {
      mockPrisma.whatsAppTemplate.findUnique.mockResolvedValue({
        id: 1, name: 'Welcome', category: 'Saluti', body: 'Ciao', isActive: true,
      });
      mockPrisma.whatsAppTemplate.create.mockResolvedValue({ id: 2, name: 'Welcome (Copia)', category: 'Saluti', body: 'Ciao', isActive: true });

      const result = await service.duplicateTemplate(1);

      expect(result.name).toBe('Welcome (Copia)');
    });

    it('should throw when original not found', async () => {
      mockPrisma.whatsAppTemplate.findUnique.mockResolvedValue(null);
      await expect(service.duplicateTemplate(999))
        .rejects.toThrow(new AppError('Template non trovato', 404, 'WHATSAPP_TEMPLATE_NOT_FOUND'));
    });
  });

  describe('sendMessage', () => {
    it('should send manual message without template', async () => {
      mockPrisma.whatsAppMessageLog.create.mockResolvedValue({
        id: 1, message: 'Ciao!', status: 'MANUAL_SENT',
        template: null, customer: null, booking: null, createdBy: { id: 1, name: 'Admin' },
      });

      const result = await service.sendMessage({
        message: 'Ciao!',
        recipientPhone: '+39 123 456 7890',
        recipientName: 'Mario',
      }, 1);

      expect(result.whatsappUrl).toContain('https://wa.me/');
      expect(result.message).toBe('Ciao!');
    });

    it('should render template with variables', async () => {
      mockPrisma.whatsAppTemplate.findUnique.mockResolvedValue({
        id: 1, name: 'Welcome', body: 'Ciao {{name}}!', isActive: true, deletedAt: null,
      });
      mockPrisma.whatsAppMessageLog.create.mockResolvedValue({
        id: 1, message: 'Ciao Mario!', status: 'MANUAL_SENT',
        template: {}, customer: null, booking: null, createdBy: { id: 1, name: 'Admin' },
      });

      const result = await service.sendMessage({
        templateId: 1,
        recipientPhone: '+39 123',
        recipientName: 'Mario',
        variables: { name: 'Mario' },
      }, 1);

      expect(result.message).toBe('Ciao Mario!');
    });

    it('should throw when template is inactive', async () => {
      mockPrisma.whatsAppTemplate.findUnique.mockResolvedValue({
        id: 1, name: 'Inactive', body: 'Ciao', isActive: false, deletedAt: null,
      });

      await expect(service.sendMessage({ templateId: 1, recipientPhone: '+39 123', variables: {} }, 1))
        .rejects.toThrow(new AppError('Il template selezionato non è attivo', 400, 'WHATSAPP_TEMPLATE_INACTIVE'));
    });

    it('should throw when template body missing variables', async () => {
      mockPrisma.whatsAppTemplate.findUnique.mockResolvedValue({
        id: 1, name: 'Test', body: 'Ciao {{name}} {{surname}}!', isActive: true, deletedAt: null,
      });

      await expect(service.sendMessage({
        templateId: 1, recipientPhone: '+39 123', recipientName: 'Mario', variables: { name: 'Mario' },
      }, 1)).rejects.toThrow(new AppError(
        'Compila prima queste variabili: surname',
        400, 'WHATSAPP_VARIABLES_MISSING',
        ['surname']
      ));
    });

    it('should throw when message is empty', async () => {
      await expect(service.sendMessage({ message: '', recipientPhone: '+39 123' }, 1))
        .rejects.toThrow(new AppError('Il messaggio da inviare è obbligatorio', 400, 'WHATSAPP_MESSAGE_REQUIRED'));
    });

    it('should throw when phone is invalid', async () => {
      await expect(service.sendMessage({ message: 'Ciao', recipientPhone: 'abc' }, 1))
        .rejects.toThrow(new AppError('Il numero di telefono non è valido', 400, 'WHATSAPP_PHONE_INVALID'));
    });
  });
});
