import { TemplateService } from './template.service';
import prisma from '../../core/shared/utils/prisma';

describe('TemplateService', () => {
  let service: TemplateService;
  let testTemplateId: string;

  beforeAll(async () => {
    service = new TemplateService();

    // Clear any test data
    await prisma.template.deleteMany({
      where: {
        name: {
          contains: 'test-template'
        }
      }
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.template.deleteMany({
      where: {
        name: {
          contains: 'test-template'
        }
      }
    });
    await prisma.$disconnect();
  });

  describe('create', () => {
    it('should create a new template', async () => {
      const templateData = {
        name: 'test-template-' + Date.now(),
        description: 'A test template',
        content: '<p>Test content</p>',
        isActive: true,
      };

      const result = await service.create(templateData);
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(templateData.name);

      testTemplateId = result.id;
    });
  });

  describe('findById', () => {
    it('should find a template by ID', async () => {
      const result = await service.findById(testTemplateId);
      expect(result).toBeDefined();
      expect(result?.id).toBe(testTemplateId);
    });
  });

  describe('find', () => {
    it('should find templates with filters', async () => {
      const result = await service.find({
        where: {
          name: {
            contains: 'test-template'
          }
        }
      });

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('update', () => {
    it('should update an existing template', async () => {
      const updates = {
        description: 'Updated description',
        isActive: false,
      };

      const result = await service.update(testTemplateId, updates);
      expect(result).toBeDefined();
      expect(result.description).toBe(updates.description);
      expect(result.isActive).toBe(updates.isActive);
    });
  });

  describe('delete', () => {
    it('should soft delete a template', async () => {
      const result = await service.delete(testTemplateId);
      expect(result).toBeDefined();
      expect(result.deletedAt).not.toBeNull();

      // Verify it's not found in regular queries
      const afterDelete = await service.findById(testTemplateId);
      expect(afterDelete).toBeNull();
    });
  });

  describe('count', () => {
    it('should return correct count', async () => {
      // Create a couple more test templates
      await service.create({
        name: 'test-template-count-1',
        description: 'Count test 1',
      });

      await service.create({
        name: 'test-template-count-2',
        description: 'Count test 2',
      });

      const count = await service.count({
        where: {
          name: {
            contains: 'test-template-count'
          }
        }
      });

      expect(count).toBeGreaterThanOrEqual(2);

      // Clean up
      await prisma.template.deleteMany({
        where: {
          name: {
            contains: 'test-template-count'
          }
        }
      });
    });
  });
});
