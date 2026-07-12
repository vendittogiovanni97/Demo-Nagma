import { AppError } from '../../../src/core/shared/errors/AppError';

const createMockPrisma = () => ({
  formTemplate: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
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
import { FormTemplateService } from '../../../src/modules/form-template/services/formTemplateService';

const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;

function templateRow(overrides = {}) {
  return { id: 1, name: 'Modulo', schemaB64: 'eyJmb3JtIjogInRlc3QifQ==', createdAt: new Date(), updatedAt: new Date(), ...overrides };
}

describe('FormTemplateService', () => {
  let service: FormTemplateService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new FormTemplateService();
  });

  describe('findAll', () => {
    it('should return all non-deleted templates', async () => {
      mockPrisma.formTemplate.findMany.mockResolvedValue([templateRow()]);
      const result = await service.findAll({});
      expect(result).toHaveLength(1);
      expect(result[0]).not.toHaveProperty('deletedAt');
    });

    it('should filter by date range', async () => {
      mockPrisma.formTemplate.findMany.mockResolvedValue([]);
      await service.findAll({ startDate: '2026-01-01', endDate: '2026-12-31' });
      expect(mockPrisma.formTemplate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ createdAt: expect.any(Object) }) })
      );
    });
  });

  describe('findById', () => {
    it('should return template when found', async () => {
      mockPrisma.formTemplate.findFirst.mockResolvedValue(templateRow());
      const result = await service.findById(1);
      expect(result).toMatchObject({ id: 1, name: 'Modulo' });
    });

    it('should return null when not found', async () => {
      mockPrisma.formTemplate.findFirst.mockResolvedValue(null);
      expect(await service.findById(999)).toBeNull();
    });
  });

  describe('create', () => {
    it('should create template', async () => {
      mockPrisma.formTemplate.create.mockResolvedValue(templateRow());
      const result = await service.create({ name: 'Modulo', schemaB64: 'dGVzdA==' });
      expect(result).toMatchObject({ name: 'Modulo' });
    });
  });

  describe('update', () => {
    it('should update existing template', async () => {
      mockPrisma.formTemplate.findFirst.mockResolvedValue(templateRow());
      mockPrisma.formTemplate.update.mockResolvedValue(templateRow({ name: 'Updated' }));

      const result = await service.update(1, { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('should throw when template not found', async () => {
      mockPrisma.formTemplate.findFirst.mockResolvedValue(null);
      await expect(service.update(999, { name: 'X' }))
        .rejects.toThrow(new AppError('Template non trovato', 404, 'NOT_FOUND'));
    });
  });

  describe('delete', () => {
    it('should soft-delete template', async () => {
      await service.delete(1);
      expect(mockPrisma.formTemplate.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });
});
