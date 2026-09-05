import nodemailer from 'nodemailer';

const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-msg-id' });
const mockCreateTransport = jest.fn().mockReturnValue({ sendMail: mockSendMail });

jest.mock('nodemailer', () => ({
  __esModule: true,
  default: {
    createTransport: (...args: any[]) => mockCreateTransport(...args),
  },
  createTransport: (...args: any[]) => mockCreateTransport(...args),
}));

const createMockPrisma = () => ({
  user: { findMany: jest.fn().mockResolvedValue([{ id: 1, name: 'Admin' }]) },
  staff: { findMany: jest.fn().mockResolvedValue([]) },
  customer: { findMany: jest.fn().mockResolvedValue([]) },
  booking: { findMany: jest.fn().mockResolvedValue([]) },
});

jest.mock('../../../src/core/shared/utils/prisma', () => ({
  __esModule: true,
  default: createMockPrisma(),
}));

import { BackupService } from '../../../src/core/backup/backup.service';

describe('BackupService', () => {
  let backupService: BackupService;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/nagmadb';
    backupService = new BackupService();
    delete process.env.BACKUP_EMAIL_ALL_AVVIO;
  });

  describe('createDump', () => {
    it('dovrebbe generare un buffer .dump valido con metadati e collezioni', async () => {
      const result = await backupService.createDump();

      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.filename).toMatch(/^backup_database_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}\.dump$/);
      expect(result.metadata.version).toBe('1.0');
      expect(result.metadata.databaseName).toBe('nagmadb');
      expect(result.metadata.totalDocuments).toBeGreaterThanOrEqual(1);
      expect(result.dumpPayload.data.user).toEqual([{ id: 1, name: 'Admin' }]);
    });
  });

  describe('sendBackupEmail', () => {
    it('dovrebbe inviare un email via nodemailer con l allegato .dump', async () => {
      const dumpResult = await backupService.createDump();
      await backupService.sendBackupEmail(dumpResult);

      expect(mockCreateTransport).toHaveBeenCalled();
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining(dumpResult.filename),
          attachments: [
            expect.objectContaining({
              filename: dumpResult.filename,
              contentType: 'application/octet-stream',
            }),
          ],
        })
      );
    });
  });

  describe('createAndSendBackupEmail', () => {
    it('dovrebbe eseguire il backup ed inviare l email quando BACKUP_EMAIL_ALL_AVVIO=true', async () => {
      process.env.BACKUP_EMAIL_ALL_AVVIO = 'true';
      await backupService.createAndSendBackupEmail();

      expect(mockSendMail).toHaveBeenCalled();
    });

    it('dovrebbe saltare l invio quando BACKUP_EMAIL_ALL_AVVIO=false', async () => {
      process.env.BACKUP_EMAIL_ALL_AVVIO = 'false';
      await backupService.createAndSendBackupEmail();

      expect(mockSendMail).not.toHaveBeenCalled();
    });

    it('dovrebbe gestire eventuali errori di invio senza lanciare eccezioni', async () => {
      process.env.BACKUP_EMAIL_ALL_AVVIO = 'true';
      mockSendMail.mockRejectedValueOnce(new Error('SMTP Connection Refused'));

      await expect(backupService.createAndSendBackupEmail()).resolves.not.toThrow();
    });
  });
});
