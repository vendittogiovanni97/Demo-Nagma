import { AppError } from '../../../src/core/shared/errors/AppError';

jest.mock('../../../src/core/shared/utils/filesystem', () => ({
  FileSystemManager: {
    saveFile: jest.fn(),
    readFile: jest.fn(),
    deleteFile: jest.fn(),
  },
}));

jest.mock('../../../src/core/shared/utils/preview', () => ({
  PreviewManager: {
    generatePreview: jest.fn(),
    getPreview: jest.fn(),
  },
}));

const createMockPrisma = () => ({
  booking: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
  },
  attachment: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
});

jest.mock('../../../src/core/shared/utils/prisma', () => ({
  __esModule: true,
  default: createMockPrisma(),
}));

import prisma from '../../../src/core/shared/utils/prisma';
import { AttachmentService } from '../../../src/modules/attachment/services/attachmentService';
import { FileSystemManager } from '../../../src/core/shared/utils/filesystem';
import { PreviewManager } from '../../../src/core/shared/utils/preview';

const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;
const mockFs = FileSystemManager as jest.Mocked<typeof FileSystemManager>;
const mockPreview = PreviewManager as jest.Mocked<typeof PreviewManager>;

describe('AttachmentService', () => {
  let service: AttachmentService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AttachmentService();
    (mockFs.saveFile as jest.Mock).mockResolvedValue({ filePath: '/uploads/test.pdf', fileName: 'test.pdf' });
    (mockPreview.generatePreview as jest.Mock).mockResolvedValue({ previewPath: '/previews/test.png', isPlaceholder: false });
  });

  describe('upload', () => {
    it('should upload file and create attachment record', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue({ id: 1 });
      mockPrisma.attachment.create.mockResolvedValue({ id: 'att-uuid', bookingId: 1, fileName: 'test.pdf', fileSize: 100, mimeType: 'application/pdf', filePath: '/uploads/test.pdf' });

      const result = await service.upload({ bookingId: 1, fileName: 'test.pdf', buffer: Buffer.alloc(100), mimeType: 'application/pdf' });

      expect(result.fileName).toBe('test.pdf');
      expect(mockFs.saveFile).toHaveBeenCalled();
      expect(mockPreview.generatePreview).toHaveBeenCalled();
    });

    it('should throw when booking not found', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue(null);

      await expect(service.upload({ bookingId: 999, fileName: 't.pdf', buffer: Buffer.alloc(1), mimeType: 'text/plain' }))
        .rejects.toThrow(new AppError('Booking non trovato', 404, 'BOOKING_NOT_FOUND'));
    });
  });

  describe('download', () => {
    it('should return attachment buffer when file exists', async () => {
      mockPrisma.attachment.findFirst.mockResolvedValue({ id: 'att-1', filePath: '/uploads/test.pdf' });
      (mockFs.readFile as jest.Mock).mockResolvedValue(Buffer.from('file-content'));

      const { attachment, buffer } = await service.download('att-1');

      expect(attachment.id).toBe('att-1');
      expect(buffer.toString()).toBe('file-content');
    });

    it('should throw when attachment not found', async () => {
      mockPrisma.attachment.findFirst.mockResolvedValue(null);

      await expect(service.download('att-xxx'))
        .rejects.toThrow(new AppError('Allegato non trovato', 404, 'ATTACHMENT_NOT_FOUND'));
    });

    it('should throw when file not found on disk', async () => {
      mockPrisma.attachment.findFirst.mockResolvedValue({ id: 'att-1', filePath: '/uploads/missing.pdf' });
      (mockFs.readFile as jest.Mock).mockRejectedValue(new Error('ENOENT'));

      await expect(service.download('att-1'))
        .rejects.toThrow(new AppError('File non trovato nel server', 404, 'FILE_NOT_FOUND'));
    });
  });

  describe('getPreview', () => {
    it('should return preview if available', async () => {
      (mockPreview.getPreview as jest.Mock).mockResolvedValue('/previews/test.png');
      const result = await service.getPreview('att-1');
      expect(result).toBe('/previews/test.png');
    });

    it('should return null if preview fails', async () => {
      (mockPreview.getPreview as jest.Mock).mockRejectedValue(new Error('no preview'));
      expect(await service.getPreview('att-1')).toBeNull();
    });
  });

  describe('findByBooking', () => {
    it('should return all attachments for a booking', async () => {
      mockPrisma.attachment.findMany.mockResolvedValue([{ id: 'att-1' }]);
      const result = await service.findByBooking(1);
      expect(result).toHaveLength(1);
    });
  });

  describe('delete', () => {
    it('should delete file and soft-delete record', async () => {
      mockPrisma.attachment.findFirst.mockResolvedValue({ id: 'att-1', filePath: '/uploads/test.pdf' });
      (mockFs.deleteFile as jest.Mock).mockResolvedValue(undefined);

      await service.delete('att-1');

      expect(mockFs.deleteFile).toHaveBeenCalledWith('/uploads/test.pdf');
      expect(mockPrisma.attachment.update).toHaveBeenCalledWith({
        where: { id: 'att-1' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should throw when attachment not found', async () => {
      mockPrisma.attachment.findFirst.mockResolvedValue(null);
      await expect(service.delete('att-xxx'))
        .rejects.toThrow(new AppError('Allegato non trovato', 404, 'ATTACHMENT_NOT_FOUND'));
    });

    it('should tolerate filesystem deletion failure', async () => {
      mockPrisma.attachment.findFirst.mockResolvedValue({ id: 'att-1', filePath: '/uploads/test.pdf' });
      (mockFs.deleteFile as jest.Mock).mockRejectedValue(new Error('permission denied'));

      await expect(service.delete('att-1')).resolves.not.toThrow();
      expect(mockPrisma.attachment.update).toHaveBeenCalled();
    });
  });
});
