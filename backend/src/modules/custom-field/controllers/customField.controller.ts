import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../../../core/middleware/auth.middleware';
import { CustomFieldService, CustomFieldData } from '../services/customFieldService';
import { asyncHandler } from '../../../core/shared/utils/asyncHandler';
import { validate } from '../../../core/shared/utils/validation';

const customFieldSchema = z.object({
  entityType: z.string().min(1).max(100),
  fieldName: z.string().min(1).max(100),
  fieldType: z.enum(['text', 'number', 'boolean', 'date', 'select', 'textarea']),
  fieldLabel: z.string().min(1).max(200),
  isRequired: z.boolean().optional(),
  defaultValue: z.unknown().optional(),
  options: z.array(z.string()).optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

const customFieldUpdateSchema = customFieldSchema.partial();

function getParam(params: Record<string, unknown>, key: string): string {
  const value = params[key];
  return Array.isArray(value) ? String(value[0]) : String(value);
}

export class CustomFieldController {
  constructor(private readonly customFieldService: CustomFieldService) {}

  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const clientId = 1;
    const { entityType } = req.query;

    const fields = await this.customFieldService.getAll(clientId, entityType as string);
    res.json({ success: true, data: fields });
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const clientId = 1;
    const id = getParam(req.params, 'id');

    const field = await this.customFieldService.getById(id, clientId);
    if (!field) {
      return res.status(404).json({ success: false, error: 'Custom field not found' });
    }

    res.json({ success: true, data: field });
  });

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const clientId = 1;
    const data = validate(customFieldSchema, req.body) as CustomFieldData;

    const field = await this.customFieldService.create(clientId, data);
    res.status(201).json({ success: true, data: field });
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const clientId = 1;
    const id = getParam(req.params, 'id');
    const data = validate(customFieldUpdateSchema, req.body) as Partial<CustomFieldData>;

    const field = await this.customFieldService.update(id, clientId, data);
    res.json({ success: true, data: field });
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const clientId = 1;
    const id = getParam(req.params, 'id');

    await this.customFieldService.delete(id, clientId);
    res.json({ success: true, message: 'Custom field deleted' });
  });

  validate = asyncHandler(async (req: AuthRequest, res: Response) => {
    const clientId = 1;
    const { entityType, customData } = req.body;

    const result = await this.customFieldService.validateCustomData(entityType, clientId, customData);
    res.json({ success: true, data: result });
  });
}