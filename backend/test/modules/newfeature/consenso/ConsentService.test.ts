const createMockPrisma = () => ({
  attachment: {
    create: jest.fn(),
  },
  booking: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
});

jest.mock('../../../../src/core/shared/utils/prisma', () => ({
  __esModule: true,
  default: createMockPrisma(),
}));

jest.mock('../../../../src/core/shared/utils/logger', () => ({
  logger: { info: jest.fn() },
}));

jest.mock('../../../../src/modules/newfeature/consenso/infrastructure/PdfGenerator', () => ({
  PdfGenerator: {
    generateConsentPdf: jest.fn(),
  },
}));

import prisma from '../../../../src/core/shared/utils/prisma';
import { ConsentService } from '../../../../src/modules/newfeature/consenso/services/consentService';
import { PdfGenerator } from '../../../../src/modules/newfeature/consenso/infrastructure/PdfGenerator';

const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;
const mockPdf = PdfGenerator as jest.Mocked<typeof PdfGenerator>;

describe('ConsentService', () => {
  let service: ConsentService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ConsentService();
  });

  describe('processConsent', () => {
    const medicalAnswers = {
      maggiorenne: true,
      gravidanza: false,
      allergie: true,
      allergieDettagli: 'Nichel',
      anticoagulanti: false,
      cardiopatie: false,
      epilessia: false,
      malattieInfettive: false,
      diabete: false,
      accettaPermanenza: true,
      accettaPrivacy: true,
    };

    it('should process consent and create attachment', async () => {
      (mockPdf.generateConsentPdf as jest.Mock).mockResolvedValue({
        fileName: 'consenso_1.pdf',
        filePath: '/uploads/consenso_1.pdf',
        fileSize: 1024,
      });

      mockPrisma.attachment.create.mockResolvedValue({ id: 'att-1', bookingId: 1 });
      mockPrisma.booking.findUnique.mockResolvedValue({ id: 1, formData: null });
      mockPrisma.booking.update.mockResolvedValue({});

      const result = await service.processConsent(1, 'Mario Rossi', '+39 123', 'DOC-001', medicalAnswers, 'data:image/png;base64,sig');

      expect(result).toMatchObject({
        attachmentId: 'att-1',
        hasMedicalAlerts: true,
        medicalAlertsDetails: 'Allergia: Nichel',
      });
    });

    it('should generate medical alerts for each condition', async () => {
      const fullAnswers = { ...medicalAnswers, gravidanza: true, anticoagulanti: true, cardiopatie: true, epilessia: true, malattieInfettive: true, diabete: true };

      (mockPdf.generateConsentPdf as jest.Mock).mockResolvedValue({
        fileName: 'consenso_2.pdf', filePath: '/uploads/consenso_2.pdf', fileSize: 2048,
      });
      mockPrisma.attachment.create.mockResolvedValue({ id: 'att-2' });
      mockPrisma.booking.findUnique.mockResolvedValue({ id: 2, formData: {} });
      mockPrisma.booking.update.mockResolvedValue({});

      const result = await service.processConsent(2, 'Luigi', '+39 456', 'DOC-002', fullAnswers, 'sig');

      expect(result.medicalAlertsDetails).toContain('gravidanza');
      expect(result.medicalAlertsDetails).toContain('anticoagulanti');
      expect(result.hasMedicalAlerts).toBe(true);
    });

    it('should have no alerts when all answers are negative', async () => {
      const cleanAnswers = { ...medicalAnswers, allergie: false };

      (mockPdf.generateConsentPdf as jest.Mock).mockResolvedValue({
        fileName: 'consenso_3.pdf', filePath: '/uploads/consenso_3.pdf', fileSize: 512,
      });
      mockPrisma.attachment.create.mockResolvedValue({ id: 'att-3' });
      mockPrisma.booking.findUnique.mockResolvedValue({ id: 3, formData: null });
      mockPrisma.booking.update.mockResolvedValue({});

      const result = await service.processConsent(3, 'Anna', '+39 789', 'DOC-003', cleanAnswers, 'sig');

      expect(result.hasMedicalAlerts).toBe(false);
      expect(result.medicalAlertsDetails).toBe('');
    });

    it('should merge consent into existing formData', async () => {
      (mockPdf.generateConsentPdf as jest.Mock).mockResolvedValue({
        fileName: 'consenso_4.pdf', filePath: '/uploads/consenso_4.pdf', fileSize: 100,
      });
      mockPrisma.attachment.create.mockResolvedValue({ id: 'att-4' });
      mockPrisma.booking.findUnique.mockResolvedValue({ id: 4, formData: { placement: { zone: 'braccio' } } });
      mockPrisma.booking.update.mockResolvedValue({});

      await service.processConsent(4, 'Pino', '+39 000', 'DOC-004', medicalAnswers, 'sig');

      expect(mockPrisma.booking.update).toHaveBeenCalledWith({
        where: { id: 4 },
        data: {
          formData: expect.objectContaining({
            placement: { zone: 'braccio' },
            consent: expect.objectContaining({ signed: true, documentId: 'DOC-004' }),
          }),
        },
      });
    });
  });
});
